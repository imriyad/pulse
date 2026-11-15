import { describe, expect, it } from "vitest";
import { createWorkspaceSchema, slugify, slugSchema } from "./workspace";

describe("slugSchema", () => {
  it.each(["acme", "acme-inc", "a1b2c3", "my-cool-app-2"])("accepts %s", (slug) => {
    expect(slugSchema.safeParse(slug).success).toBe(true);
  });

  it.each([
    ["ab", "too short"],
    ["-acme", "leading hyphen"],
    ["acme-", "trailing hyphen"],
    ["ac--me", "double hyphen"],
    ["ac me", "space"],
    ["acme_inc", "underscore"],
    ["a".repeat(41), "too long"],
    ["dashboard", "reserved"],
    ["api", "reserved"],
  ])("rejects %s (%s)", (slug) => {
    expect(slugSchema.safeParse(slug).success).toBe(false);
  });

  it("normalises case and whitespace", () => {
    expect(slugSchema.parse("  Acme-Inc ")).toBe("acme-inc");
  });
});

describe("createWorkspaceSchema", () => {
  it("returns per-field errors", () => {
    const result = createWorkspaceSchema.safeParse({ name: "a", slug: "api" });
    expect(result.success).toBe(false);
    const paths = result.error!.issues.map((issue) => issue.path[0]);
    expect(paths).toContain("name");
    expect(paths).toContain("slug");
  });
});

describe("slugify", () => {
  it.each([
    ["Acme Inc.", "acme-inc"],
    ["  Café   Olé  ", "cafe-ole"],
    ["100% Feedback!!", "100-feedback"],
  ])("%s -> %s", (input, expected) => {
    expect(slugify(input)).toBe(expected);
  });

  it("produces a slug that passes validation", () => {
    expect(slugSchema.safeParse(slugify("My New Product")).success).toBe(true);
  });
});
