import { db } from "@/server/db/client";

export const hasTestDb = Boolean(process.env.TEST_DATABASE_URL);

/** Deletes all rows. Workspace/User cascades remove everything that hangs off them. */
export async function resetDb() {
  await db.$transaction([
    db.rateLimitBucket.deleteMany(),
    db.verificationToken.deleteMany(),
    db.workspace.deleteMany(),
    db.user.deleteMany(),
  ]);
}

let counter = 0;
export async function createUser(name = "user") {
  counter += 1;
  return db.user.create({ data: { name, email: `${name}-${counter}-${Date.now()}@test.local` } });
}

export async function createWorkspaceWithOwner(slug: string) {
  const owner = await createUser(`owner-${slug}`);
  const workspace = await db.workspace.create({
    data: { name: slug, slug, memberships: { create: { userId: owner.id, role: "OWNER" } } },
  });
  return { owner, workspace };
}
