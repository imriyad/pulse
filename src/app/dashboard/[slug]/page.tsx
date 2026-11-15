import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Check, Clock, MessageSquareText, ThumbsUp, Users } from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { requireWorkspaceAccess } from "@/server/session";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { workspace } = await requireWorkspaceAccess(slug);
  return { title: `${workspace.name} dashboard` };
}

export default async function WorkspaceDashboardPage({ params }: Props) {
  const { slug } = await params;
  const { workspace, db, user } = await requireWorkspaceAccess(slug);

  // tenantDb: no workspaceId filter needed here, the client adds it.
  const [feedbackCount, voteCount, pendingCount, memberCount] = await Promise.all([
    db.feedback.count(),
    db.vote.count(),
    db.feedback.count({ where: { moderation: "PENDING" } }),
    db.membership.count(),
  ]);

  const firstName = (user.name ?? user.email ?? "there").split(/[\s@]/)[0];

  const checklist = [
    { label: "Create your workspace", done: true },
    { label: "Share your public board", done: feedbackCount > 0 },
    { label: "Collect your first vote", done: voteCount > 0 },
    { label: "Invite a teammate", done: memberCount > 1 },
  ];
  const completed = checklist.filter((item) => item.done).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, {firstName}</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Here&apos;s what&apos;s happening on {workspace.name}.
          </p>
        </div>
        <Link
          href={`/${workspace.slug}`}
          target="_blank"
          className="bg-primary text-primary-foreground glow-primary inline-flex h-9 items-center gap-1.5 rounded-lg px-4 text-sm font-medium shadow-sm hover:opacity-90"
        >
          Open public board <ArrowUpRight className="size-4" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Feedback items"
          value={feedbackCount}
          icon={MessageSquareText}
          tone="indigo"
        />
        <StatCard label="Total votes" value={voteCount} icon={ThumbsUp} tone="violet" />
        <StatCard label="Awaiting moderation" value={pendingCount} icon={Clock} tone="amber" />
        <StatCard label="Team members" value={memberCount} icon={Users} tone="emerald" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="bg-card rounded-2xl border p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Getting started</h2>
            <span className="text-muted-foreground text-xs">
              {completed} of {checklist.length} done
            </span>
          </div>
          <div className="bg-muted mt-3 h-1.5 overflow-hidden rounded-full">
            <div
              className="bg-primary h-full rounded-full transition-all"
              style={{ width: `${(completed / checklist.length) * 100}%` }}
            />
          </div>
          <ul className="mt-5 space-y-3">
            {checklist.map((item) => (
              <li key={item.label} className="flex items-center gap-3 text-sm">
                <span
                  className={cn(
                    "flex size-5 items-center justify-center rounded-full border",
                    item.done && "border-primary bg-primary text-primary-foreground",
                  )}
                >
                  {item.done && <Check className="size-3" />}
                </span>
                <span className={cn(item.done && "text-muted-foreground line-through")}>
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-card rounded-2xl border p-6">
          <h2 className="font-semibold">Your public board</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Share this link with your users so they can post and vote on ideas.
          </p>
          <div className="bg-muted mt-4 flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm">
            <code className="truncate">/{workspace.slug}</code>
            <CopyButton value={`/${workspace.slug}`} />
          </div>
          <div className="mt-6 rounded-xl border border-dashed p-6 text-center">
            <MessageSquareText className="text-muted-foreground mx-auto size-8" />
            <p className="mt-2 text-sm font-medium">No feedback yet</p>
            <p className="text-muted-foreground mt-1 text-xs">
              New ideas will show up here as soon as users post them.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

const TONES = {
  indigo: "bg-indigo-100 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-300",
  violet: "bg-violet-100 text-violet-600 dark:bg-violet-400/10 dark:text-violet-300",
  amber: "bg-amber-100 text-amber-600 dark:bg-amber-400/10 dark:text-amber-300",
  emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300",
};

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  tone: keyof typeof TONES;
}) {
  return (
    <div className="bg-card rounded-2xl border p-5">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">{label}</p>
        <span className={cn("flex size-9 items-center justify-center rounded-lg", TONES[tone])}>
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight">{value.toLocaleString()}</p>
    </div>
  );
}
