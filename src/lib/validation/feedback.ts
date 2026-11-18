import { z } from "zod";

/** Honeypot field name. Real users never see it; bots that fill every input do. */
export const HONEYPOT_FIELD = "website";

export const createFeedbackSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Give your idea a short title (at least 5 characters).")
    .max(120, "Keep the title under 120 characters."),
  description: z.string().trim().max(2000, "Keep the description under 2000 characters.").default(""),
});
export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>;

export const createCommentSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Write something before posting.")
    .max(2000, "Keep comments under 2000 characters."),
});
export type CreateCommentInput = z.infer<typeof createCommentSchema>;

export const BOARD_SORTS = ["top", "new"] as const;
export type BoardSort = (typeof BOARD_SORTS)[number];

export const BOARD_STATUS_FILTERS = ["OPEN", "PLANNED", "IN_PROGRESS", "SHIPPED"] as const;
export type BoardStatusFilter = (typeof BOARD_STATUS_FILTERS)[number];

export const PAGE_SIZE = 20;

/**
 * Board filters come from the URL, so they are untrusted. Invalid values fall
 * back to defaults instead of erroring: a hand-edited URL should still render.
 */
export const boardQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .max(100)
    .optional()
    .catch(undefined)
    .transform((v) => v || undefined),
  sort: z.enum(BOARD_SORTS).catch("top"),
  status: z.enum(BOARD_STATUS_FILTERS).optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(500).catch(1),
});
export type BoardQuery = z.infer<typeof boardQuerySchema>;

export function parseBoardQuery(params: Record<string, string | string[] | undefined>): BoardQuery {
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  return boardQuerySchema.parse({
    q: first(params.q),
    sort: first(params.sort),
    status: first(params.status),
    page: first(params.page),
  });
}
