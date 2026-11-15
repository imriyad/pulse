# Pulse

Multi-tenant product feedback and roadmap platform. Companies create a workspace and get a
public board at `/{slug}` where users submit ideas, vote and comment. The team triages feedback in
a dashboard, publishes a roadmap, embeds a widget, and receives signed webhooks.

Portfolio project. Code should be production quality: small modules, shared Zod schemas, tests
alongside features, useful error messages.

## Stack

- Next.js 15 (App Router, Server Components, Server Actions) + TypeScript strict
- PostgreSQL + Prisma 6 (Neon in production, docker compose locally)
- Auth.js v5: email magic link (Nodemailer) + GitHub, Prisma adapter, **database sessions**
- Tailwind v4 + shadcn/ui (Base UI primitives) in `src/components/ui`
- Zod 4 for all input validation
- Vitest (unit + integration against real Postgres), Playwright (a few E2E)
- GitHub Actions CI, Vercel deployment

## Commands

| Command           | What it does                                                     |
| ----------------- | ---------------------------------------------------------------- |
| `pnpm db:up`      | Start Postgres + Mailpit (inbox at :8025)                        |
| `pnpm db:migrate` | Create/apply a migration in dev (`prisma migrate dev`)           |
| `pnpm db:seed`    | Seed the demo workspace                                          |
| `pnpm dev`        | Dev server on :3000                                              |
| `pnpm lint`       | ESLint                                                           |
| `pnpm typecheck`  | `tsc --noEmit`                                                   |
| `pnpm test`       | Vitest. Integration tests run only if `TEST_DATABASE_URL` is set |
| `pnpm test:e2e`   | Playwright                                                       |
| `pnpm format`     | Prettier                                                         |

Run integration tests locally:
`TEST_DATABASE_URL=postgresql://pulse:pulse@localhost:5432/pulse_test pnpm test`
(the `pulse_test` DB is created by `docker/init-test-db.sql`; the test run resets it).

## Folder structure

```
prisma/                 schema, migrations, seed
src/
  app/                  routes only: pages, layouts, route handlers, colocated server actions
    [slug]/             public board, roadmap (/{slug}/roadmap)
    dashboard/[slug]/   team dashboard (members/admins/owner)
    api/                auth, widget, cron, (later) public JSON endpoints
  components/           shared React components; ui/ is shadcn (generated, don't hand-edit much)
  lib/                  isomorphic code: Zod schemas (lib/validation), permissions, utils
  server/               server-only code ("server-only" import)
    db/                 Prisma client + tenant-scoped client
    services/           business logic; take a Prisma client as a param so tests can inject it
    session.ts          getCurrentUser / requireUser / requireWorkspaceAccess
  types/                module augmentation
tests/
  integration/          hit a real Postgres (skipped without TEST_DATABASE_URL)
  e2e/                  Playwright
```

## Conventions

- **Tenant isolation**: workspace data is read/written through `tenantDb(workspaceId)` (from
  `requireWorkspaceAccess` in the dashboard). It forces `workspaceId` into every filter and create.
  Every tenant table has its own `workspaceId` column. New tenant model → add it to
  `TENANT_MODELS` in `src/server/db/tenant-scope.ts` and write an isolation test.
- Unscoped `db` is only for: auth, resolving a workspace by slug, cross-tenant jobs (cron).
- **Authorization**: `requireWorkspaceAccess(slug, permission)` at the top of every dashboard page
  and server action. Permissions live in one table in `src/lib/permissions.ts`.
  Non-members get **404, not 403** (don't reveal private workspaces).
- **Validation**: every server action / route handler parses input with a Zod schema from
  `src/lib/validation`. Client forms reuse the same schema.
- **Errors**: expected failures return `ActionResult` (`{ ok: false, error, fieldErrors }`);
  only unexpected errors throw. Map Prisma `P2002` to a friendly conflict message.
- Next 15: `params` / `searchParams` are Promises; always `await` them.
- New top-level route → add its name to `RESERVED_SLUGS`.
- Conventional commits (`feat:`, `fix:`, `test:`, `docs:`, `chore:`). Run lint, typecheck, test
  before each commit.

## Architecture decisions

1. **Shared database, `workspaceId` column** (not schema-per-tenant). Simple and cheap on Neon;
   isolation enforced by the scoped Prisma client + tests. Postgres RLS is a possible hardening step.
2. **Database sessions** over JWT: instant revocation; one indexed read per request is fine.
3. **Sign-in required to submit/vote/comment** on the board; anyone can read. Makes "one vote per
   user" enforceable (`@@unique([feedbackId, userId])` on Vote).
4. **Widget is submit-only**: name/idea + email, held as `moderation = PENDING`. Avoids third-party
   cookie problems of signing in inside an iframe. Stretch: signed user identity from host site.
5. **Roles**: Member (view dashboard, tag, official replies) < Admin (status, merge, moderate,
   webhooks, widget, tags) < Owner (members/roles, delete workspace).
6. **Background jobs = transactional outbox**: `OutboxJob` rows written in the same transaction as
   the status change; attempted immediately via Next.js `after()`; retried by `/api/cron`
   (protected by `CRON_SECRET`) called every 5 minutes by a GitHub Actions schedule, because Vercel
   Hobby cron only runs daily. Retries use exponential backoff.
7. **Webhooks**: HMAC-SHA256 over `timestamp.body`, headers `Pulse-Signature` / `Pulse-Timestamp`;
   `WebhookDelivery` doubles as the delivery log.
8. **Denormalised `voteCount` / `commentCount`** updated in the same transaction as the write, so
   "sort by top" is an indexed read.
9. **Rate limiting** with a fixed-window counter in Postgres (`RateLimitBucket`): works across
   serverless instances without Redis. Spam: honeypot field + rate limit + moderation queue.

## Milestones

- **M1 Foundation** (week 1): scaffold, schema, Docker, CI, Auth.js, workspaces + roles,
  tenant-scoped client, isolation tests. ✅
- **M2 Public board** (week 2): submit, vote/unvote, comments, search/filter/sort, rate limiting,
  spam protection, voting-rule tests.
- **M3 Dashboard** (week 2–3): status changes, merge duplicates, tags, moderation queue, official
  replies, member management, public roadmap page.
- **M4 Integrations** (week 3): outbox + cron, webhooks (signing, retries, delivery log), voter
  emails, embeddable widget.
- **M5 Polish** (week 4): analytics charts, seed data, Playwright E2E, README with Mermaid diagram,
  deploy to Vercel + Neon, CV bullets. Stretch: AI duplicate detection, CSV export, dark mode/a11y.
