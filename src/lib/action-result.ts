import type { z } from "zod";

/**
 * Uniform return type for server actions and services. Expected failures
 * (validation, conflicts) are returned as values; only unexpected errors throw.
 */
export type ActionResult<T = undefined> =
  { ok: true; data: T } | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export function fieldErrors(error: z.ZodError): {
  ok: false;
  error: string;
  fieldErrors: Record<string, string[]>;
} {
  const result: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    (result[key] ??= []).push(issue.message);
  }
  return { ok: false, error: "Please fix the highlighted fields.", fieldErrors: result };
}
