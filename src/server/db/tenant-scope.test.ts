import { describe, expect, it } from "vitest";
import { scopeArgs, TenantScopeError } from "./tenant-scope";

const WS = "ws_a";

describe("scopeArgs", () => {
  it("leaves non-tenant models untouched", () => {
    const args = { where: { email: "a@b.c" } };
    expect(scopeArgs("User", "findMany", args, WS)).toBe(args);
  });

  it.each(["findMany", "findFirst", "findUnique", "count", "updateMany", "deleteMany", "delete"])(
    "adds workspaceId to where for %s",
    (operation) => {
      const result = scopeArgs("Feedback", operation, { where: { id: "f1" } }, WS);
      expect(result?.where).toEqual({ id: "f1", workspaceId: WS });
    },
  );

  it("adds a where clause when none was given", () => {
    expect(scopeArgs("Feedback", "findMany", undefined, WS)).toEqual({
      where: { workspaceId: WS },
    });
  });

  it("overrides a caller-supplied workspaceId in filters (cannot read another tenant)", () => {
    const result = scopeArgs("Feedback", "findMany", { where: { workspaceId: "ws_b" } }, WS);
    expect(result?.where).toEqual({ workspaceId: WS });
  });

  it("injects workspaceId on create", () => {
    const result = scopeArgs("Tag", "create", { data: { name: "bug" } }, WS);
    expect(result?.data).toEqual({ name: "bug", workspaceId: WS });
  });

  it("injects workspaceId on every createMany row", () => {
    const result = scopeArgs("Tag", "createMany", { data: [{ name: "a" }, { name: "b" }] }, WS);
    expect(result?.data).toEqual([
      { name: "a", workspaceId: WS },
      { name: "b", workspaceId: WS },
    ]);
  });

  it("refuses to create a row in another workspace", () => {
    expect(() =>
      scopeArgs("Tag", "create", { data: { name: "x", workspaceId: "ws_b" } }, WS),
    ).toThrow(TenantScopeError);
  });

  it("refuses to move a row to another workspace on update", () => {
    expect(() =>
      scopeArgs("Feedback", "update", { where: { id: "f1" }, data: { workspaceId: "ws_b" } }, WS),
    ).toThrow(TenantScopeError);
  });

  it("scopes both sides of an upsert", () => {
    const result = scopeArgs(
      "Vote",
      "upsert",
      { where: { id: "v1" }, create: { feedbackId: "f1", userId: "u1" }, update: {} },
      WS,
    );
    expect(result?.where).toEqual({ id: "v1", workspaceId: WS });
    expect(result?.create).toEqual({ feedbackId: "f1", userId: "u1", workspaceId: WS });
  });
});
