import "server-only";
import { Prisma, type PrismaClient } from "@prisma/client";
import { createWorkspaceSchema } from "@/lib/validation/workspace";
import { type ActionResult, fieldErrors } from "@/lib/action-result";

/**
 * Creates a workspace and makes the creator its Owner, atomically.
 * Takes the Prisma client as an argument so integration tests can pass a test DB.
 */
export async function createWorkspace(
  prisma: PrismaClient,
  userId: string,
  rawInput: unknown,
): Promise<ActionResult<{ slug: string }>> {
  const parsed = createWorkspaceSchema.safeParse(rawInput);
  if (!parsed.success) return fieldErrors(parsed.error);

  const { name, slug } = parsed.data;

  try {
    const workspace = await prisma.workspace.create({
      data: {
        name,
        slug,
        memberships: { create: { userId, role: "OWNER" } },
      },
      select: { slug: true },
    });
    return { ok: true, data: workspace };
  } catch (error) {
    // Rely on the unique index rather than "check then insert", which races.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        ok: false,
        error: "That slug is already taken.",
        fieldErrors: { slug: ["That slug is already taken."] },
      };
    }
    throw error;
  }
}

export function listUserWorkspaces(prisma: PrismaClient, userId: string) {
  return prisma.membership.findMany({
    where: { userId },
    include: { workspace: { select: { name: true, slug: true } } },
    orderBy: { createdAt: "asc" },
  });
}
