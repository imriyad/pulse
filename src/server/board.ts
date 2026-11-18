import "server-only";
import { cache } from "react";
import { db } from "@/server/db/client";
import { tenantDb } from "@/server/db/tenant";
import type { BoardScope } from "@/server/services/feedback";

/**
 * Resolves a public board from its slug. This is one of the few legitimate uses
 * of the unscoped client (resolving a workspace by slug); everything after it
 * goes through the tenant-scoped client.
 */
export const getBoard = cache(async (slug: string) => {
  const workspace = await db.workspace.findUnique({
    where: { slug },
    select: { id: true, name: true, slug: true },
  });
  if (!workspace) return null;
  const scope: BoardScope = { db: tenantDb(workspace.id), workspaceId: workspace.id };
  return { workspace, scope };
});
