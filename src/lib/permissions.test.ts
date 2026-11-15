import { describe, expect, it } from "vitest";
import { can, hasRole, PERMISSIONS, type Permission } from "./permissions";

describe("hasRole", () => {
  it("lets higher roles satisfy lower requirements", () => {
    expect(hasRole("OWNER", "ADMIN")).toBe(true);
    expect(hasRole("OWNER", "MEMBER")).toBe(true);
    expect(hasRole("ADMIN", "MEMBER")).toBe(true);
  });

  it("does not let lower roles satisfy higher requirements", () => {
    expect(hasRole("MEMBER", "ADMIN")).toBe(false);
    expect(hasRole("ADMIN", "OWNER")).toBe(false);
  });
});

describe("can", () => {
  it.each<[Permission, boolean, boolean, boolean]>([
    // permission            member  admin  owner
    ["dashboard:view", true, true, true],
    ["feedback:tag", true, true, true],
    ["comment:official", true, true, true],
    ["feedback:status", false, true, true],
    ["feedback:merge", false, true, true],
    ["feedback:moderate", false, true, true],
    ["webhooks:manage", false, true, true],
    ["members:manage", false, false, true],
    ["workspace:delete", false, false, true],
  ])("%s -> member:%s admin:%s owner:%s", (permission, member, admin, owner) => {
    expect(can("MEMBER", permission)).toBe(member);
    expect(can("ADMIN", permission)).toBe(admin);
    expect(can("OWNER", permission)).toBe(owner);
  });

  it("every permission is allowed for owners", () => {
    for (const permission of Object.keys(PERMISSIONS) as Permission[]) {
      expect(can("OWNER", permission)).toBe(true);
    }
  });
});
