import { z } from "zod";

/**
 * Slugs that would collide with app routes, because public boards live at
 * the root (/{slug}). Add to this list whenever a new top-level route is created.
 */
export const RESERVED_SLUGS = new Set([
  "api",
  "app",
  "admin",
  "auth",
  "dashboard",
  "new",
  "signin",
  "signout",
  "login",
  "logout",
  "settings",
  "widget",
  "embed",
  "static",
  "public",
  "_next",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  "pricing",
  "docs",
  "about",
  "help",
  "support",
]);

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Slug must be at least 3 characters")
  .max(40, "Slug must be at most 40 characters")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use lowercase letters, numbers and single hyphens (no leading or trailing hyphen)",
  )
  .refine((slug) => !RESERVED_SLUGS.has(slug), "This slug is reserved, please pick another");

export const createWorkspaceSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(60),
  slug: slugSchema,
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;

/** Suggests a slug from a workspace name, e.g. "Acme Inc." -> "acme-inc". */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
}
