/**
 * Pure argument-rewriting logic for the tenant-scoped Prisma client.
 * Kept separate from Prisma itself so it can be unit-tested without a database.
 */

/** Models that carry a `workspaceId` column and must always be filtered by it. */
export const TENANT_MODELS = new Set([
  "Membership",
  "Feedback",
  "Vote",
  "Comment",
  "Tag",
  "FeedbackTag",
  "StatusChange",
  "Webhook",
  "WebhookDelivery",
  "OutboxJob",
]);

const WHERE_OPERATIONS = new Set([
  "findUnique",
  "findUniqueOrThrow",
  "findFirst",
  "findFirstOrThrow",
  "findMany",
  "count",
  "aggregate",
  "groupBy",
  "update",
  "updateMany",
  "delete",
  "deleteMany",
]);

type Args = Record<string, unknown> | undefined;

export class TenantScopeError extends Error {}

function assertNoForeignWorkspace(value: unknown, workspaceId: string, model: string) {
  if (
    value &&
    typeof value === "object" &&
    "workspaceId" in value &&
    (value as { workspaceId: unknown }).workspaceId !== undefined &&
    (value as { workspaceId: unknown }).workspaceId !== workspaceId
  ) {
    throw new TenantScopeError(
      `Refusing to write ${model} into a different workspace than the scoped one.`,
    );
  }
}

function withWorkspaceData(data: unknown, workspaceId: string, model: string) {
  assertNoForeignWorkspace(data, workspaceId, model);
  return { ...(data as object), workspaceId };
}

/**
 * Returns a copy of `args` with `workspaceId` forced into every filter and
 * every created row. Models outside TENANT_MODELS pass through unchanged.
 */
export function scopeArgs(model: string, operation: string, args: Args, workspaceId: string): Args {
  if (!TENANT_MODELS.has(model)) return args;

  const next: Record<string, unknown> = { ...(args ?? {}) };

  if (WHERE_OPERATIONS.has(operation)) {
    // AND-ing keeps any caller-supplied workspaceId from widening the filter.
    next.where = { ...((next.where as object) ?? {}), workspaceId };
  }

  switch (operation) {
    case "create":
      next.data = withWorkspaceData(next.data, workspaceId, model);
      break;
    case "createMany":
    case "createManyAndReturn": {
      const rows = Array.isArray(next.data) ? next.data : [next.data];
      next.data = rows.map((row) => withWorkspaceData(row, workspaceId, model));
      break;
    }
    case "update":
    case "updateMany":
      // Moving a row to another tenant is never allowed.
      assertNoForeignWorkspace(next.data, workspaceId, model);
      break;
    case "upsert":
      next.where = { ...((next.where as object) ?? {}), workspaceId };
      next.create = withWorkspaceData(next.create, workspaceId, model);
      assertNoForeignWorkspace(next.update, workspaceId, model);
      break;
  }

  return next;
}
