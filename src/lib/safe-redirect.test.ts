import { describe, expect, it } from "vitest";
import { safeCallbackUrl } from "./safe-redirect";

describe("safeCallbackUrl", () => {
  it("keeps same-site relative paths", () => {
    expect(safeCallbackUrl("/dashboard/acme")).toBe("/dashboard/acme");
  });

  it.each([
    undefined,
    "",
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "javascript:alert(1)",
  ])("falls back for %s", (value) => {
    expect(safeCallbackUrl(value)).toBe("/dashboard");
  });
});
