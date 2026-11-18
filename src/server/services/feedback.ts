import type { FeedbackStatus, Prisma } from "@prisma/client";
import type { ActionResult } from "@/lib/action-result";
import { fieldErrors } from "@/lib/action-result";
import {
  PAGE_SIZE,
  createCommentSchema,
  createFeedbackSchema,
  type BoardQuery,
} from "@/lib/validation/feedback";
import type { TenantDb } from "@/server/db/tenant";

/**
 * Services take a tenant-scoped client plus its workspaceId. The scoped client
 * already forces the workspace into every filter and create; the id is passed
 * only because Prisma's create types require it.
 */
export type BoardScope = { db: TenantDb; workspaceId: string };

/** What the public board is allowed to show: approved, not merged away. */
const VISIBLE = { moderation: "APPROVED", mergedIntoId: null } as const;

const NOT_AVAILABLE = "This idea is no longer available.";

export async function createFeedback(
  { db, workspaceId }: BoardScope,
  userId: string,
  rawInput: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = createFeedbackSchema.safeParse(rawInput);
  if (!parsed.success) return fieldErrors(parsed.error);

  // The author's own vote is counted from the start, like on most boards.
  const created = await db.$transaction(async (tx) => {
    const feedback = await tx.feedback.create({
      data: { workspaceId, authorId: userId, ...parsed.data, voteCount: 1 },
      select: { id: true },
    });
    await tx.vote.create({ data: { workspaceId, feedbackId: feedback.id, userId } });
    return feedback;
  });
  return { ok: true, data: { id: created.id } };
}

export type BoardItem = {
  id: string;
  title: string;
  description: string;
  status: FeedbackStatus;
  voteCount: number;
  commentCount: number;
  createdAt: Date;
  voted: boolean;
};

function boardWhere({ q, status }: Pick<BoardQuery, "q" | "status">): Prisma.FeedbackWhereInput {
  return {
    ...VISIBLE,
    // Declined ideas stay out of the default view but can be found with the filter.
    status: status ?? { not: "DECLINED" },
    ...(q && {
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    }),
  };
}

export function boardOrderBy(sort: BoardQuery["sort"]): Prisma.FeedbackOrderByWithRelationInput[] {
  return sort === "new"
    ? [{ createdAt: "desc" }, { id: "desc" }]
    : [{ voteCount: "desc" }, { createdAt: "desc" }, { id: "desc" }];
}

export async function listBoard(
  { db }: BoardScope,
  query: BoardQuery,
  viewerId?: string,
): Promise<{ items: BoardItem[]; hasMore: boolean }> {
  // Fetch one extra row to know whether a next page exists without a COUNT.
  const rows = await db.feedback.findMany({
    where: boardWhere(query),
    orderBy: boardOrderBy(query.sort),
    skip: (query.page - 1) * PAGE_SIZE,
    take: PAGE_SIZE + 1,
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      voteCount: true,
      commentCount: true,
      createdAt: true,
    },
  });
  const hasMore = rows.length > PAGE_SIZE;
  const page = rows.slice(0, PAGE_SIZE);

  const votedIds = new Set<string>();
  if (viewerId && page.length > 0) {
    const votes = await db.vote.findMany({
      where: { userId: viewerId, feedbackId: { in: page.map((r) => r.id) } },
      select: { feedbackId: true },
    });
    for (const vote of votes) votedIds.add(vote.feedbackId);
  }

  return { items: page.map((row) => ({ ...row, voted: votedIds.has(row.id) })), hasMore };
}

export async function countByStatus({ db }: BoardScope): Promise<Record<FeedbackStatus, number>> {
  const groups = await db.feedback.groupBy({
    by: ["status"],
    where: VISIBLE,
    _count: { _all: true },
  });
  const counts: Record<FeedbackStatus, number> = {
    OPEN: 0,
    PLANNED: 0,
    IN_PROGRESS: 0,
    SHIPPED: 0,
    DECLINED: 0,
  };
  for (const group of groups) counts[group.status] = group._count._all;
  return counts;
}

export async function getFeedbackDetail({ db }: BoardScope, id: string, viewerId?: string) {
  const feedback = await db.feedback.findFirst({
    where: { id, ...VISIBLE },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      voteCount: true,
      commentCount: true,
      createdAt: true,
      author: { select: { name: true, image: true, email: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          body: true,
          isOfficial: true,
          createdAt: true,
          author: { select: { name: true, image: true, email: true } },
        },
      },
    },
  });
  if (!feedback) return null;

  const voted = viewerId
    ? (await db.vote.count({ where: { feedbackId: id, userId: viewerId } })) > 0
    : false;
  return { ...feedback, voted };
}

export type VoteResult = ActionResult<{ voted: boolean; voteCount: number }>;

/**
 * Adds the user's vote, or removes it if they already voted.
 *
 * The unique (feedbackId, userId) index is the real guarantee of "one vote per
 * user". The counter only changes when a row was actually inserted or deleted,
 * so it can't drift even if two requests race.
 */
export async function toggleVote(
  { db, workspaceId }: BoardScope,
  userId: string,
  feedbackId: string,
): Promise<VoteResult> {
  try {
    return await db.$transaction(async (tx): Promise<VoteResult> => {
      const feedback = await tx.feedback.findFirst({
        where: { id: feedbackId, ...VISIBLE },
        select: { id: true },
      });
      if (!feedback) return { ok: false, error: NOT_AVAILABLE };

      const removed = await tx.vote.deleteMany({ where: { feedbackId, userId } });
      if (removed.count > 0) {
        const updated = await tx.feedback.update({
          where: { id: feedbackId },
          data: { voteCount: { decrement: 1 } },
          select: { voteCount: true },
        });
        return { ok: true, data: { voted: false, voteCount: updated.voteCount } };
      }

      await tx.vote.create({ data: { workspaceId, feedbackId, userId } });
      const updated = await tx.feedback.update({
        where: { id: feedbackId },
        data: { voteCount: { increment: 1 } },
        select: { voteCount: true },
      });
      return { ok: true, data: { voted: true, voteCount: updated.voteCount } };
    });
  } catch (error) {
    // Two simultaneous "vote" clicks: the loser hits the unique index. The user
    // did vote, so report the current state instead of an error.
    if (isUniqueViolation(error)) {
      const current = await db.feedback.findFirst({
        where: { id: feedbackId },
        select: { voteCount: true },
      });
      if (current) return { ok: true, data: { voted: true, voteCount: current.voteCount } };
    }
    throw error;
  }
}

export async function addComment(
  { db, workspaceId }: BoardScope,
  input: { userId: string; feedbackId: string; isOfficial: boolean },
  rawInput: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = createCommentSchema.safeParse(rawInput);
  if (!parsed.success) return fieldErrors(parsed.error);

  return db.$transaction(async (tx): Promise<ActionResult<{ id: string }>> => {
    const feedback = await tx.feedback.findFirst({
      where: { id: input.feedbackId, ...VISIBLE },
      select: { id: true },
    });
    if (!feedback) return { ok: false, error: NOT_AVAILABLE };

    const comment = await tx.comment.create({
      data: {
        workspaceId,
        feedbackId: input.feedbackId,
        authorId: input.userId,
        isOfficial: input.isOfficial,
        body: parsed.data.body,
      },
      select: { id: true },
    });
    await tx.feedback.update({
      where: { id: input.feedbackId },
      data: { commentCount: { increment: 1 } },
    });
    return { ok: true, data: { id: comment.id } };
  });
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" && error !== null && (error as { code?: string }).code === "P2002"
  );
}
