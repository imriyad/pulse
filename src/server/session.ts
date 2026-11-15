import "server-only";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { auth } from "@/auth";
import { db } from "@/server/db/client";
import { tenantDb } from "@/server/db/tenant";
import { can, type Permission } from "@/lib/permissions";

/** The signed-in user, or null. Cached per request. */
export const getCurrentUser = cache(async () => {
  const session = await auth();
  return session?.user?.id ? { ...session.user, id: session.user.id } : null;
});

export async function requireUser(callbackUrl?: string) {
  const user = await getCurrentUser();
  if (!user) {
    redirect(callbackUrl ? `/signin?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/signin");
  }
  return user;
}

/**
 * Entry point for every dashboard page and admin action.
 *
 * Resolves the workspace from its slug *through the user's membership*, so a
 * workspace you don't belong to is indistinguishable from one that doesn't
 * exist (404, not 403: we don't confirm that a private workspace exists).
 */
export const requireWorkspaceAccess = cache(
  async (slug: string, permission: Permission = "dashboard:view") => {
    const user = await requireUser(`/dashboard/${slug}`);

    const membership = await db.membership.findFirst({
      where: { userId: user.id, workspace: { slug } },
      include: { workspace: true },
    });

    if (!membership || !can(membership.role, permission)) notFound();

    return {
      user,
      role: membership.role as Role,
      workspace: membership.workspace,
      db: tenantDb(membership.workspaceId),
    };
  },
);
