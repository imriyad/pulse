import type { PrismaClient } from "@prisma/client";

export type RateLimitResult = { allowed: boolean; remaining: number; retryAfterSeconds: number };

/**
 * Fixed-window counter in Postgres. One atomic upsert per call, so it is safe
 * across concurrent serverless instances (no read-then-write race).
 *
 * If the stored window has expired the row restarts at count 1; otherwise the
 * counter is incremented. The caller is allowed while count <= limit.
 */
export async function consumeRateLimit(
  prisma: Pick<PrismaClient, "$queryRaw">,
  key: string,
  limit: number,
  windowSeconds: number,
  now: Date = new Date(),
): Promise<RateLimitResult> {
  const resetAt = new Date(now.getTime() + windowSeconds * 1000);
  const rows = await prisma.$queryRaw<{ count: number; resetAt: Date }[]>`
    INSERT INTO "RateLimitBucket" ("key", "count", "resetAt")
    VALUES (${key}, 1, ${resetAt})
    ON CONFLICT ("key") DO UPDATE SET
      "count"   = CASE WHEN "RateLimitBucket"."resetAt" <= ${now} THEN 1
                       ELSE "RateLimitBucket"."count" + 1 END,
      "resetAt" = CASE WHEN "RateLimitBucket"."resetAt" <= ${now} THEN ${resetAt}
                       ELSE "RateLimitBucket"."resetAt" END
    RETURNING "count", "resetAt"`;
  const row = rows[0];
  if (!row) throw new Error("Rate limit upsert returned no row");

  const retryAfterSeconds = Math.max(1, Math.ceil((row.resetAt.getTime() - now.getTime()) / 1000));
  return {
    allowed: row.count <= limit,
    remaining: Math.max(0, limit - row.count),
    retryAfterSeconds,
  };
}

/** Named limits so every call site agrees on the numbers. */
export const LIMITS = {
  submit: { limit: 5, windowSeconds: 60 * 60 },
  comment: { limit: 20, windowSeconds: 10 * 60 },
  vote: { limit: 60, windowSeconds: 60 },
} as const;

export function rateLimitMessage(retryAfterSeconds: number): string {
  const minutes = Math.ceil(retryAfterSeconds / 60);
  return minutes <= 1
    ? "You're doing that too fast. Please try again in a minute."
    : `You're doing that too fast. Please try again in ${minutes} minutes.`;
}
