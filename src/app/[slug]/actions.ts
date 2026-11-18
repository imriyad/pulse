"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/action-result";
import { HONEYPOT_FIELD } from "@/lib/validation/feedback";
import { getBoard } from "@/server/board";
import { db } from "@/server/db/client";
import { requireUser } from "@/server/session";
import { createFeedback, toggleVote, type VoteResult } from "@/server/services/feedback";
import { LIMITS, consumeRateLimit, rateLimitMessage } from "@/server/services/rate-limit";

export async function submitFeedbackAction(
  slug: string,
  _prev: ActionResult<{ id: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const user = await requireUser(`/${slug}`);
  const board = await getBoard(slug);
  if (!board) return { ok: false, error: "This board doesn't exist." };

  // Honeypot: bots fill every input. Pretend it worked so they don't adapt.
  if (formData.get(HONEYPOT_FIELD)) return { ok: true, data: { id: "" } };

  const limit = LIMITS.submit;
  const rate = await consumeRateLimit(
    db,
    `submit:${board.workspace.id}:${user.id}`,
    limit.limit,
    limit.windowSeconds,
  );
  if (!rate.allowed) return { ok: false, error: rateLimitMessage(rate.retryAfterSeconds) };

  const result = await createFeedback(board.scope, user.id, {
    title: formData.get("title"),
    description: formData.get("description") ?? "",
  });
  if (result.ok) revalidatePath(`/${slug}`);
  return result;
}

export async function toggleVoteAction(slug: string, feedbackId: string): Promise<VoteResult> {
  const user = await requireUser(`/${slug}`);
  const board = await getBoard(slug);
  if (!board) return { ok: false, error: "This board doesn't exist." };

  const limit = LIMITS.vote;
  const rate = await consumeRateLimit(
    db,
    `vote:${board.workspace.id}:${user.id}`,
    limit.limit,
    limit.windowSeconds,
  );
  if (!rate.allowed) return { ok: false, error: rateLimitMessage(rate.retryAfterSeconds) };

  const result = await toggleVote(board.scope, user.id, feedbackId);
  if (result.ok) revalidatePath(`/${slug}`);
  return result;
}
