import "server-only";
import { db } from "./client";
import { scopeArgs } from "./tenant-scope";

/**
 * A Prisma client that can only see and write rows belonging to one workspace.
 *
 * Use this for all workspace data access. Forgetting `where: { workspaceId }`
 * on a single query is the classic multi-tenant data leak; scoping at the
 * client level means it can't be forgotten.
 *
 * Note: nested writes/includes are not rewritten. Relations are reached from
 * an already-scoped parent row, so they stay inside the tenant.
 */
export function tenantDb(workspaceId: string) {
  return db.$extends({
    name: "tenant-scope",
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const scoped = scopeArgs(
            model,
            operation,
            args as Record<string, unknown> | undefined,
            workspaceId,
          );
          return query(scoped as typeof args);
        },
      },
    },
  });
}

export type TenantDb = ReturnType<typeof tenantDb>;
