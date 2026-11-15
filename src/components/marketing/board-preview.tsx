import { ChevronUp, MessageSquare, Search, Sparkles } from "lucide-react";
import type { FeedbackStatus } from "@prisma/client";
import { StatusBadge } from "@/components/status-badge";
import { cn } from "@/lib/utils";

type PreviewItem = {
  title: string;
  body: string;
  votes: number;
  comments: number;
  status: FeedbackStatus;
  voted?: boolean;
  tag: string;
};

const ITEMS: PreviewItem[] = [
  {
    title: "Dark mode for the dashboard",
    body: "Our team works late, a dark theme would be easier on the eyes.",
    votes: 248,
    comments: 32,
    status: "IN_PROGRESS",
    voted: true,
    tag: "UI",
  },
  {
    title: "Slack integration for new feedback",
    body: "Post a message to a channel whenever someone submits an idea.",
    votes: 191,
    comments: 18,
    status: "PLANNED",
    tag: "Integrations",
  },
  {
    title: "Export feedback to CSV",
    body: "We report on requests monthly and need the raw data.",
    votes: 87,
    comments: 9,
    status: "SHIPPED",
    tag: "Data",
  },
];

const BARS = [28, 42, 35, 58, 49, 72, 95];

/** Static, decorative mock of a public board for the landing page hero. */
export function BoardPreview() {
  return (
    <div className="relative">
      {/* glow behind the window */}
      <div className="absolute -inset-x-10 -top-10 bottom-0 -z-10 rounded-[3rem] bg-gradient-to-b from-indigo-500/25 via-violet-500/10 to-transparent blur-3xl" />

      <div className="glass gradient-border overflow-hidden rounded-2xl">
        {/* window chrome */}
        <div className="flex items-center gap-2 border-b border-white/5 bg-white/[0.02] px-4 py-3">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
          <span className="text-muted-foreground mx-auto rounded-md border border-white/5 bg-black/20 px-10 py-1 text-xs">
            pulse.app/acme
          </span>
          <span className="w-12" />
        </div>

        <div className="grid md:grid-cols-[1fr_240px]">
          <div className="p-4 sm:p-6">
            <div className="mb-5 flex items-center gap-2">
              <div className="text-muted-foreground flex flex-1 items-center gap-2 rounded-lg border bg-black/20 px-3 py-2 text-sm">
                <Search className="size-4" /> Search ideas…
                <kbd className="ml-auto hidden rounded border bg-white/5 px-1.5 text-[10px] sm:inline">
                  ⌘K
                </kbd>
              </div>
              <span className="bg-primary text-primary-foreground glow-primary hidden rounded-lg px-3 py-2 text-sm font-medium sm:inline">
                + New idea
              </span>
            </div>

            <div className="text-muted-foreground mb-4 flex gap-1 text-xs font-medium">
              <span className="text-foreground rounded-md bg-white/[0.06] px-2.5 py-1">Top</span>
              <span className="px-2.5 py-1">New</span>
              <span className="px-2.5 py-1">Trending</span>
            </div>

            <ul className="space-y-2.5">
              {ITEMS.map((item) => (
                <li
                  key={item.title}
                  className={cn(
                    "flex gap-4 rounded-xl border bg-white/[0.02] p-4 transition-colors",
                    item.voted && "border-primary/30 bg-primary/[0.04]",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-14 w-12 shrink-0 flex-col items-center justify-center rounded-lg border text-sm font-semibold tabular-nums",
                      item.voted
                        ? "border-primary/60 bg-primary/15 text-indigo-200 shadow-[0_0_20px_-4px] shadow-indigo-500/60"
                        : "bg-black/20",
                    )}
                  >
                    <ChevronUp className="size-4" />
                    {item.votes}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{item.title}</p>
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="text-muted-foreground mt-1 line-clamp-1 text-sm">{item.body}</p>
                    <div className="text-muted-foreground mt-2 flex items-center gap-3 text-xs">
                      <span className="rounded border bg-white/[0.03] px-1.5 py-0.5">
                        {item.tag}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="size-3.5" /> {item.comments}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <aside className="hidden border-l border-white/5 bg-black/10 p-6 md:block">
            <p className="text-muted-foreground mb-3 text-[11px] font-semibold tracking-widest uppercase">
              Roadmap
            </p>
            {(
              [
                ["PLANNED", 12],
                ["IN_PROGRESS", 5],
                ["SHIPPED", 38],
              ] as const
            ).map(([status, count]) => (
              <div key={status} className="mb-2.5 flex items-center justify-between">
                <StatusBadge status={status} />
                <span className="text-sm font-medium tabular-nums">{count}</span>
              </div>
            ))}

            <p className="text-muted-foreground mt-7 mb-1 text-[11px] font-semibold tracking-widest uppercase">
              Votes this week
            </p>
            <p className="text-2xl font-semibold tabular-nums">
              1,284 <span className="text-sm font-medium text-emerald-400">+24%</span>
            </p>
            <div className="mt-3 flex h-20 items-end gap-1.5">
              {BARS.map((height, index) => (
                <span
                  key={index}
                  className={cn(
                    "flex-1 rounded-t bg-gradient-to-t from-indigo-500/40 to-indigo-400/80",
                    index === BARS.length - 1 && "from-violet-500/60 to-fuchsia-400",
                  )}
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>

            <div className="mt-7 rounded-lg border border-violet-400/20 bg-violet-500/10 p-3 text-xs">
              <p className="flex items-center gap-1.5 font-medium text-violet-200">
                <Sparkles className="size-3.5" /> Possible duplicate
              </p>
              <p className="text-muted-foreground mt-1">
                &ldquo;Night theme&rdquo; looks like &ldquo;Dark mode&rdquo;. Merge?
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
