import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/server/db/client";
import { tenantDb } from "@/server/db/tenant";
import { TenantScopeError } from "@/server/db/tenant-scope";
import { createWorkspaceWithOwner, hasTestDb, resetDb } from "../helpers/db";

describe.skipIf(!hasTestDb)("tenant isolation (real database)", () => {
  let a: Awaited<ReturnType<typeof createWorkspaceWithOwner>>;
  let b: Awaited<ReturnType<typeof createWorkspaceWithOwner>>;
  let feedbackInB: { id: string };

  beforeEach(async () => {
    await resetDb();
    a = await createWorkspaceWithOwner("tenant-a");
    b = await createWorkspaceWithOwner("tenant-b");

    await db.feedback.create({
      data: { workspaceId: a.workspace.id, title: "A idea", description: "from A" },
    });
    feedbackInB = await db.feedback.create({
      data: { workspaceId: b.workspace.id, title: "B idea", description: "from B" },
    });
  });

  it("lists only the scoped workspace's rows", async () => {
    const rows = await tenantDb(a.workspace.id).feedback.findMany();
    expect(rows.map((row) => row.title)).toEqual(["A idea"]);
  });

  it("cannot read another workspace's row by id", async () => {
    const row = await tenantDb(a.workspace.id).feedback.findUnique({
      where: { id: feedbackInB.id },
    });
    expect(row).toBeNull();
  });

  it("cannot update another workspace's row by id", async () => {
    await expect(
      tenantDb(a.workspace.id).feedback.update({
        where: { id: feedbackInB.id },
        data: { title: "hijacked" },
      }),
    ).rejects.toThrow();

    const untouched = await db.feedback.findUniqueOrThrow({ where: { id: feedbackInB.id } });
    expect(untouched.title).toBe("B idea");
  });

  it("cannot bulk-delete across workspaces", async () => {
    const { count } = await tenantDb(a.workspace.id).feedback.deleteMany();
    expect(count).toBe(1);
    expect(await db.feedback.count({ where: { workspaceId: b.workspace.id } })).toBe(1);
  });

  it("creates rows in the scoped workspace without passing workspaceId", async () => {
    const tag = await tenantDb(a.workspace.id).tag.create({
      data: { name: "bug" } as { name: string; workspaceId: string },
    });
    expect(tag.workspaceId).toBe(a.workspace.id);
  });

  it("refuses to create rows in another workspace", async () => {
    await expect(
      tenantDb(a.workspace.id).tag.create({ data: { name: "bug", workspaceId: b.workspace.id } }),
    ).rejects.toBeInstanceOf(TenantScopeError);
  });

  it("counts only the scoped workspace's members", async () => {
    expect(await tenantDb(a.workspace.id).membership.count()).toBe(1);
  });
});
