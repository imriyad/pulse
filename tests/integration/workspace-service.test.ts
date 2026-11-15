import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/server/db/client";
import { createWorkspace } from "@/server/services/workspace";
import { createUser, hasTestDb, resetDb } from "../helpers/db";

describe.skipIf(!hasTestDb)("createWorkspace (real database)", () => {
  beforeEach(resetDb);

  it("creates the workspace and makes the creator its owner", async () => {
    const user = await createUser();
    const result = await createWorkspace(db, user.id, { name: "Acme", slug: "acme" });

    expect(result).toEqual({ ok: true, data: { slug: "acme" } });
    const membership = await db.membership.findFirstOrThrow({ where: { userId: user.id } });
    expect(membership.role).toBe("OWNER");
  });

  it("returns a field error when the slug is taken", async () => {
    const first = await createUser();
    const second = await createUser();
    await createWorkspace(db, first.id, { name: "Acme", slug: "acme" });

    const result = await createWorkspace(db, second.id, { name: "Other", slug: "acme" });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.fieldErrors?.slug).toEqual(["That slug is already taken."]);
  });

  it("rejects invalid input without touching the database", async () => {
    const user = await createUser();
    const result = await createWorkspace(db, user.id, { name: "x", slug: "Bad Slug" });

    expect(result.ok).toBe(false);
    expect(await db.workspace.count()).toBe(0);
  });
});
