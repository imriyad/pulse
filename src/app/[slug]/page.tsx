import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { Lightbulb, Map, MessageSquareText, Search } from "lucide-react";
import { Logo } from "@/components/logo";
import { StatusBadge } from "@/components/status-badge";
import { UserAvatar } from "@/components/user-avatar";
import { buttonVariants } from "@/components/ui/button";
import { db } from "@/server/db/client";
import { getCurrentUser } from "@/server/session";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

const getWorkspace = cache((slug: string) =>
  db.workspace.findUnique({ where: { slug }, select: { id: true, name: true, slug: true } }),
);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const workspace = await getWorkspace((await params).slug);
  return { title: workspace ? `${workspace.name} feedback` : "Not found" };
}

export default async function PublicBoardPage({ params }: Props) {
  const { slug } = await params;
  const [workspace, user] = await Promise.all([getWorkspace(slug), getCurrentUser()]);
  if (!workspace) notFound();

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
            <div className="bg-background text-muted-foreground flex h-10 flex-1 items-center gap-2 rounded-lg border px-3 text-sm">
              <Search className="size-4" /> Search ideas…
            </div>
            <div className="bg-background flex h-10 items-center gap-1 rounded-lg border p-1 text-sm">
              {["Top", "New", "Trending"].map((label, i) => (
                <span
                  key={label}
                  className={cn(
                    "rounded-md px-3 py-1",
                    i === 0
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-background mt-6 flex flex-col items-center rounded-2xl border border-dashed px-6 py-16 text-center">
            <span className="bg-accent text-primary flex size-14 items-center justify-center rounded-full">
              <Lightbulb className="size-7" />
            </span>
            <h2 className="mt-5 text-lg font-semibold">No ideas yet</h2>
            <p className="text-muted-foreground mt-1 max-w-sm text-sm">
              Be the first to tell {workspace.name} what to build next. Submitting and voting arrive
              in the next milestone.
            </p>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="bg-background rounded-2xl border p-5">
            <h2 className="font-semibold">Got an idea?</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Share it with the {workspace.name} team. Others can vote it up.
            </p>
            <span
              aria-disabled
              className={cn(buttonVariants(), "pointer-events-none mt-4 w-full opacity-60")}
            >
              Submit an idea
            </span>
          </div>
          <div className="bg-background rounded-2xl border p-5">
            <h2 className="mb-3 text-sm font-semibold">Status</h2>
            <div className="space-y-2">
              {(["PLANNED", "IN_PROGRESS", "SHIPPED"] as const).map((status) => (
                <div key={status} className="flex items-center justify-between text-sm">
                  <StatusBadge status={status} />
                  <span className="text-muted-foreground">0</span>
                </div>
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
