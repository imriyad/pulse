import type { FeedbackStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

export const STATUS_META: Record<
  FeedbackStatus,
  { label: string; className: string; dot: string }
> = {
  OPEN: {
    label: "Open",
    className:
      "bg-slate-100 text-slate-700 ring-slate-300/60 dark:bg-slate-400/10 dark:text-slate-300 dark:ring-slate-400/20",
    dot: "bg-slate-400",
  },
  PLANNED: {
    label: "Planned",
    className:
      "bg-sky-100 text-sky-700 ring-sky-300/60 dark:bg-sky-400/10 dark:text-sky-300 dark:ring-sky-400/25",
    dot: "bg-sky-400",
  },
  IN_PROGRESS: {
    label: "In progress",
    className:
      "bg-amber-100 text-amber-800 ring-amber-300/60 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/25",
    dot: "bg-amber-400",
  },
  SHIPPED: {
    label: "Shipped",
    className:
      "bg-emerald-100 text-emerald-700 ring-emerald-300/60 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/25",
    dot: "bg-emerald-400",
  },
  DECLINED: {
    label: "Declined",
    className:
      "bg-rose-100 text-rose-700 ring-rose-300/60 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/25",
    dot: "bg-rose-400",
  },
};

export function StatusBadge({ status, className }: { status: FeedbackStatus; className?: string }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset",
        meta.className,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", meta.dot)} aria-hidden />
      {meta.label}
    </span>
  );
}
