import "server-only";
import { z } from "zod";

/**
 * Validated server environment. Importing this module fails fast with a clear
 * message if a required variable is missing, instead of failing later deep
 * inside a request.
 */
const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(16, "AUTH_SECRET must be at least 16 characters"),
  AUTH_GITHUB_ID: z.string().optional().default(""),
  AUTH_GITHUB_SECRET: z.string().optional().default(""),
  EMAIL_SERVER: z.string().min(1),
  EMAIL_FROM: z.string().min(1),
  APP_URL: z.url().default("http://localhost:3000"),
  CRON_SECRET: z.string().optional().default(""),
});

function loadEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment variables (see .env.example):\n${issues}`);
  }
  return parsed.data;
}

export const env = loadEnv();

export const githubAuthEnabled = Boolean(env.AUTH_GITHUB_ID && env.AUTH_GITHUB_SECRET);
