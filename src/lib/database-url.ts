/**
 * Postgres connection string for the app. Netlify DB (Neon) injects
 * NETLIFY_DATABASE_URL; an explicit DATABASE_URL (local, CI, own Neon) wins.
 * Its own module so the Prisma client can use it without loading all env checks.
 */
export function databaseUrl(): string | undefined {
  return process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL || undefined;
}
