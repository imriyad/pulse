import { beforeEach, describe, expect, it } from "vitest";
import { parseBoardQuery } from "@/lib/validation/feedback";
import { db } from "@/server/db/client";
import { tenantDb } from "@/server/db/tenant";
import {
  addComment,
  createFeedback,
  listBoard,
  toggleVote,
  type BoardScope,
} from "@/server/services/feedback";
import { consumeRateLimit } from "@/server/services/rate-limit";
import { createUser, createWorkspaceWithOwner, hasTestDb, resetDb } from "../helpers/db";

const query = parseBoardQuery({});

function scopeFor(workspaceId: string): BoardScope {
  return { db: tenantDb(workspaceId), workspaceId };
}

async function setup() {
  const { workspace } = await createWorkspaceWithOwner("acme");
  const scope = scopeFor(workspace.id);
  const author = await createUser("author");
  const created = await createFeedback(scope, author.id, { title: "Dark mode please" });
  if (!created.ok) throw new Error("setup failed");
  return { workspace, scope, author, feedbackId: created.data.id };
}

describe.skipIf(!hasTestDb)("voting rules (real database)", () => {
  beforeEach(resetDb);

  it("counts the author's own vote when an idea is created", async () => {
    const { scope, author, feedbackId } = await setup();
    const { items } = await listBoard(scope, query, author.id);

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ id: feedbackId, voteCount: 1, voted: true });
  });

  it("lets a user vote once and unvote, keeping the counter in sync", async () => {
    const { scope, feedbackId } = await setup();
    const voter = await createUser("voter");

    const up = await toggleVote(scope, voter.id, feedbackId);
    expect(up).toEqual({ ok: true, data: { voted: true, voteCount: 2 } });

    const down = await toggleVote(scope, voter.id, feedbackId);
    expect(down).toEqual({ ok: true, data: { voted: false, voteCount: 1 } });
    expect(await db.vote.count({ where: { feedbackId } })).toBe(1);
  });

  it("never double-counts when the same user votes concurrently", async () => {
    const { scope, feedbackId } = await setup();
    const voter = await createUser("voter");

    await Promise.allSettled(
      Array.from({ length: 5 }, () => toggleVote(scope, voter.id, feedbackId)),
    );

    const votes = await db.vote.count({ where: { feedbackId, userId: voter.id } });
    const feedback = await db.feedback.findUniqueOrThrow({ where: { id: feedbackId } });
    expect(votes).toBeLessThanOrEqual(1);
    // Counter always equals the author's vote plus the real vote rows.
    expect(feedback.voteCount).toBe(1 + votes);
  });

  it("refuses to vote on ideas that are pending moderation", async () => {
    const { scope, feedbackId } = await setup();
    await db.feedback.update({ where: { id: feedbackId }, data: { moderation: "PENDING" } });
    const voter = await createUser("voter");

    const result = await toggleVote(scope, voter.id, feedbackId);

    expect(result.ok).toBe(false);
  });

  it("cannot vote on another workspace's idea", async () => {
    const { feedbackId } = await setup();
    const { workspace: other } = await createWorkspaceWithOwner("globex");
    const voter = await createUser("voter");

    const result = await toggleVote(scopeFor(other.id), voter.id, feedbackId);

    expect(result.ok).toBe(false);
    expect(await db.vote.count({ where: { userId: voter.id } })).toBe(0);
  });

  it("increments commentCount with each comment and rejects empty ones", async () => {
    const { scope, author, feedbackId } = await setup();
    const input = { userId: author.id, feedbackId, isOfficial: false };

    expect((await addComment(scope, input, { body: "Agreed!" })).ok).toBe(true);
    expect((await addComment(scope, input, { body: "   " })).ok).toBe(false);

    const feedback = await db.feedback.findUniqueOrThrow({ where: { id: feedbackId } });
    expect(feedback.commentCount).toBe(1);
  });

  it("hides declined ideas from the default board", async () => {
    const { scope, feedbackId } = await setup();
    await db.feedback.update({ where: { id: feedbackId }, data: { status: "DECLINED" } });

    expect((await listBoard(scope, query)).items).toHaveLength(0);
  });
});

describe.skipIf(!hasTestDb)("consumeRateLimit (real database)", () => {
  beforeEach(resetDb);

  it("allows up to the limit, then blocks until the window resets", async () => {
    const start = new Date("2026-01-01T00:00:00Z");
    const results = [];
    for (let i = 0; i < 4; i++) results.push(await consumeRateLimit(db, "k", 3, 60, start));
    expect(results.map((r) => r.allowed)).toEqual([true, true, true, false]);

    const later = new Date(start.getTime() + 61_000);
    expect((await consumeRateLimit(db, "k", 3, 60, later)).allowed).toBe(true);
  });
});
