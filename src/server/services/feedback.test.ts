import { describe, expect, it } from "vitest";
import { boardOrderBy } from "./feedback";

describe("boardOrderBy", () => {
  it("sorts by votes first for 'top', newest breaking ties", () => {
    expect(boardOrderBy("top")).toEqual([
      { voteCount: "desc" },
      { createdAt: "desc" },
      { id: "desc" },
    ]);
  });

  it("sorts newest first for 'new'", () => {
    expect(boardOrderBy("new")[0]).toEqual({ createdAt: "desc" });
  });

  it("always ends with id so pagination order is stable", () => {
    expect(boardOrderBy("top").at(-1)).toEqual({ id: "desc" });
    expect(boardOrderBy("new").at(-1)).toEqual({ id: "desc" });
  });
});
