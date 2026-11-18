import { describe, expect, it, vi } from "vitest";
import { consumeRateLimit, rateLimitMessage } from "./rate-limit";

function fakePrisma(count: number, resetAt: Date) {
  return { $queryRaw: vi.fn().mockResolvedValue([{ count, resetAt }]) };
}

describe("consumeRateLimit", () => {
  const now = new Date("2026-01-01T00:00:00Z");
  const reset = new Date("2026-01-01T00:10:00Z");

  it("allows requests up to the limit", async () => {
    const result = await consumeRateLimit(fakePrisma(5, reset), "k", 5, 600, now);
    expect(result).toEqual({ allowed: true, remaining: 0, retryAfterSeconds: 600 });
  });

  it("blocks once the limit is exceeded and reports when to retry", async () => {
    const result = await consumeRateLimit(fakePrisma(6, reset), "k", 5, 600, now);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.retryAfterSeconds).toBe(600);
  });

  it("never reports less than one second to wait", async () => {
    const result = await consumeRateLimit(fakePrisma(9, now), "k", 5, 600, now);
    expect(result.retryAfterSeconds).toBe(1);
  });
});

describe("rateLimitMessage", () => {
  it("rounds up to whole minutes", () => {
    expect(rateLimitMessage(30)).toContain("a minute");
    expect(rateLimitMessage(61)).toContain("2 minutes");
  });
});
