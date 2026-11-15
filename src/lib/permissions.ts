import type { Role } from "@prisma/client";

/** Higher number = more privileges. Each role inherits everything below it. */
const ROLE_RANK: Record<Role, number> = {
  MEMBER: 1,
  ADMIN: 2,
  OWNER: 3,
};

export function hasRole(actual: Role, required: Role): boolean {
  return ROLE_RANK[actual] >= ROLE_RANK[required];
}

/**
 * Every permission-checked action and the minimum role that may perform it.
 * Keeping this in one table makes the access model easy to review and test.
 */
export const PERMISSIONS = {
  "dashboard:view": "MEMBER",
  "feedback:tag": "MEMBER",
  "comment:official": "MEMBER",
  "feedback:status": "ADMIN",
  "feedback:merge": "ADMIN",
  "feedback:moderate": "ADMIN",
  "tags:manage": "ADMIN",
  "webhooks:manage": "ADMIN",
  "widget:manage": "ADMIN",
  "members:manage": "OWNER",
  "workspace:delete": "OWNER",
} as const satisfies Record<string, Role>;

export type Permission = keyof typeof PERMISSIONS;

export function can(role: Role, permission: Permission): boolean {
  return hasRole(role, PERMISSIONS[permission]);
}
