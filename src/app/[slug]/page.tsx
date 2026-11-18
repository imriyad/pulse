import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Lightbulb, Map, MessageSquare, MessageSquareText, Search } from "lucide-react";
import { Logo } from "@/components/logo";
import { StatusBadge } from "@/components/status-badge";
import { UserAvatar } from "@/components/user-avatar";
import { buttonVariants } from "@/components/ui/button";
import { getBoard } from "@/server/board";
import { getCurrentUser } from "@/server/session";
import { countByStatus, listBoard } from "@/server/services/feedback";
import { BOARD_SORTS, parseBoardQuery, type BoardQuery } from "@/lib/validation/feedback";
import { cn } from "@/lib/utils";
import { SubmitForm } from "./submit-form";
import { VoteButton } from "./vote-button";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const SORT_LABELS = { top: "Top", new: "New" } as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const board = await getBoard((await params).slug);
  return { title: board ? `${board.workspace.name} feedback` : "Not found" };
}

/** Builds a board URL, dropping defaults so links stay short. */
function boardHref(slug: string, query: Partial<BoardQuery>): string {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.sort && query.sort !== "top") params.set("sort", query.sort);
  if (query.status) params.set("status", query.status);
  if (query.page && query.page > 1) params.set("page", String(query.page));
  const qs = params.toString();
  return qs ? `/${slug}?${qs}` : `/${slug}`;
}

export default async function PublicBoardPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const query = parseBoardQuery(await searchParams);
  const [board, user] = await Promise.all([getBoard(slug), getCurrentUser()]);
  if (!board) notFound();
  const { workspace, scope } = board;

  const [{ items, hasMore }, counts] = await Promise.all([
    listBoard(scope, query, user?.id),
    countByStatus(scope),
  ]);
  const filtered = Boolean(query.q || query.status);

  return (
    <div className="bg-background relative min-h-dvh">
      {/* Workspace-branded header */}
      <header className="bg-background border-b">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-sm font-bold text-white">
              {workspace.name.slice(0, 1).toUpperCase()}
            </span>
            <span className="font-semibold">{workspace.name}</span>
          </div>
          {user ? (
            <UserAvatar name={user.name} email={user.email} image={user.image} />
          ) : (
            <Link
              href={`/signin?callbackUrl=/${workspace.slug}`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Sign in
            </Link>
          )}
        </div>
        <nav className="mx-auto flex max-w-5xl gap-6 px-4 text-sm sm:px-6">
          <span className="border-primary text-foreground flex items-center gap-2 border-b-2 pb-3 font-medium">
            <MessageSquareText className="size-4" /> Feedback
          </span>
          <span className="text-muted-foreground flex items-center gap-2 pb-3">
            <Map className="size-4" /> Roadmap
          </span>
        </nav>
      </header>

      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_280px]">
        <section>
          <div className="flex flex-col gap-3 sm:flex-row">
            <form action={`/${workspace.slug}`} role="search" className="flex-1">
              {query.sort !== "top" && <input type="hidden" name="sort" value={query.sort} />}
              {query.status && <input type="hidden" name="status" value={query.status} />}
              <label className="bg-background focus-within:ring-ring/50 flex h-10 items-center gap-2 rounded-lg border px-3 text-sm focus-within:ring-3">
                <Search className="text-muted-foreground size-4" />
                <span className="sr-only">Search ideas</span>
                <input
                  name="q"
                  defaultValue={query.q}
                  maxLength={100}
                  placeholder="Search ideas…"
                  className="h-full flex-1 bg-transparent outline-none"
                />
              </label>
            </form>
            <nav
              aria-label="Sort"
              className="bg-background flex h-10 items-center gap-1 rounded-lg border p-1 text-sm"
            >
              {BOARD_SORTS.map((sort) => (
                <Link
                  key={sort}
                  href={boardHref(workspace.slug, { ...query, sort, page: 1 })}
                  aria-current={query.sort === sort ? "true" : undefined}
                  className={cn(
                    "rounded-md px-3 py-1",
                    query.sort === sort
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {SORT_LABELS[sort]}
                </Link>
              ))}
            </nav>
          </div>

          {items.length === 0 ? (
            <div className="bg-background mt-6 flex flex-col items-center rounded-2xl border border-dashed px-6 py-16 text-center">
              <span className="bg-accent text-primary flex size-14 items-center justify-center rounded-full">
                <Lightbulb className="size-7" />
              </span>
              <h2 className="mt-5 text-lg font-semibold">
                {filtered ? "No matching ideas" : "No ideas yet"}
              </h2>
              <p className="text-muted-foreground mt-1 max-w-sm text-sm">
                {filtered ? (
                  <Link href={`/${workspace.slug}`} className="text-primary underline">
                    Clear filters
                  </Link>
                ) : (
                  `Be the first to tell ${workspace.name} what to build next.`
                )}
              </p>
            </div>
          ) : (
            <ul className="mt-6 space-y-3">
              {items.map((item) => (
                <li key={item.id} className="bg-background flex gap-4 rounded-2xl border p-4">
                  {user ? (
                    <VoteButton
                      slug={workspace.slug}
                      feedbackId={item.id}
                      voted={item.voted}
                      voteCount={item.voteCount}
                    />
                  ) : (
                    <Link
                      href={`/signin?callbackUrl=/${workspace.slug}`}
                      aria-label={`Sign in to vote. ${item.voteCount} votes`}
                      className="hover:border-primary/50 flex h-fit w-12 flex-col items-center rounded-lg border py-1.5 text-sm font-semibold"
                    >
                      ▲<span>{item.voteCount}</span>
                    </Link>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-medium">{item.title}</h2>
                      {item.status !== "OPEN" && <StatusBadge status={item.status} />}
                    </div>
                    {item.description && (
                      <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                        {item.description}
                      </p>
                    )}
                    <p className="text-muted-foreground mt-2 flex items-center gap-1 text-xs">
                      <MessageSquare className="size-3.5" /> {item.commentCount}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {(query.page > 1 || hasMore) && (
            <nav aria-label="Pagination" className="mt-6 flex justify-between text-sm">
              {query.page > 1 ? (
                <Link
                  href={boardHref(workspace.slug, { ...query, page: query.page - 1 })}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  ← Previous
                </Link>
              ) : (
                <span />
              )}
              {hasMore && (
                <Link
                  href={boardHref(workspace.slug, { ...query, page: query.page + 1 })}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  Next →
                </Link>
              )}
            </nav>
          )}
        </section>

        <aside className="space-y-4">
          <div className="bg-background rounded-2xl border p-5">
            <h2 className="font-semibold">Got an idea?</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Share it with the {workspace.name} team. Others can vote it up.
            </p>
            {user ? (
              <SubmitForm slug={workspace.slug} />
            ) : (
              <Link
                href={`/signin?callbackUrl=/${workspace.slug}`}
                className={cn(buttonVariants(), "mt-4 w-full")}
              >
                Sign in to submit
              </Link>
            )}
          </div>
          <div className="bg-background rounded-2xl border p-5">
            <h2 className="mb-3 text-sm font-semibold">Status</h2>
            <div className="space-y-2">
              {(["PLANNED", "IN_PROGRESS", "SHIPPED"] as const).map((status) => (
                <Link
                  key={status}
                  href={boardHref(workspace.slug, {
                    ...query,
                    status: query.status === status ? undefined : status,
                    page: 1,
                  })}
                  aria-current={query.status === status ? "true" : undefined}
                  className={cn(
                    "-mx-2 flex items-center justify-between rounded-md px-2 py-1 text-sm",
                    query.status === status ? "bg-accent" : "hover:bg-accent/50",
                  )}
                >
                  <StatusBadge status={status} />
                  <span className="text-muted-foreground">{counts[status]}</span>
                </Link>
              ))}
            </div>
          </div>
          <div className="text-muted-foreground flex items-center justify-center gap-2 text-xs">
            Powered by <Logo className="scale-75" />
          </div>
        </aside>
      </main>
    </div>
  );
}
