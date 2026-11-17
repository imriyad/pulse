import { afterEach, describe, expect, it, vi } from "vitest";
import { databaseUrl } from "./database-url";

describe("databaseUrl", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("prefers an explicit DATABASE_URL", () => {
    vi.stubEnv("DATABASE_URL", "postgres://explicit");
    vi.stubEnv("NETLIFY_DATABASE_URL", "postgres://netlify");
    expect(databaseUrl()).toBe("postgres://explicit");
  });

  it("falls back to Netlify DB's NETLIFY_DATABASE_URL", () => {
    vi.stubEnv("DATABASE_URL", "");
    vi.stubEnv("NETLIFY_DATABASE_URL", "postgres://netlify");
    expect(databaseUrl()).toBe("postgres://netlify");
  });

  it("returns undefined when neither is set", () => {
    vi.stubEnv("DATABASE_URL", "");
    vi.stubEnv("NETLIFY_DATABASE_URL", "");
    expect(databaseUrl()).toBeUndefined();
  });
});
