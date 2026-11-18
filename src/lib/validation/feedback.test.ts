import { describe, expect, it } from "vitest";
import { createCommentSchema, createFeedbackSchema, parseBoardQuery } from "./feedback";

describe("createFeedbackSchema", () => {
  it("trims and accepts a valid idea", () => {
    const parsed = createFeedbackSchema.parse({ title: "  Dark mode please  ", description: " yes " });
    expect(parsed).toEqual({ title: "Dark mode please", description: "yes" });
  });

  it("defaults a missing description to an empty string", () => {
    expect(createFeedbackSchema.parse({ title: "Export to CSV" }).description).toBe("");
  });

  it("rejects short and overlong titles with a helpful message", () => {
    const short = createFeedbackSchema.safeParse({ title: "hi" });
    expect(short.success).toBe(false);
    expect(createFeedbackSchema.safeParse({ title: "x".repeat(121) }).success).toBe(false);
  });
});

describe("createCommentSchema", () => {
  it("rejects whitespace-only comments", () => {
    expect(createCommentSchema.safeParse({ body: "   " }).success).toBe(false);
  });
  it("accepts normal comments", () => {
    expect(createCommentSchema.parse({ body: " Same here " }).body).toBe("Same here");
  });
});

describe("parseBoardQuery", () => {
  it("applies defaults for an empty query string", () => {
    expect(parseBoardQuery({})).toEqual({ q: undefined, sort: "top", status: undefined, page: 1 });
  });

  it("reads valid values", () => {
    expect(parseBoardQuery({ q: " csv ", sort: "new", status: "PLANNED", page: "3" })).toEqual({
      q: "csv",
      sort: "new",
      status: "PLANNED",
      page: 3,
    });
  });

  it("falls back instead of throwing on hand-edited garbage", () => {
    expect(parseBoardQuery({ sort: "banana", status: "NOPE", page: "-4" })).toEqual({
      q: undefined,
      sort: "top",
      status: undefined,
      page: 1,
    });
  });

  it("takes the first value when a param is repeated", () => {
    expect(parseBoardQuery({ sort: ["new", "top"] }).sort).toBe("new");
  });
});
