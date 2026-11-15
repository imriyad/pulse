import { ChevronUp } from "lucide-react";
import { Logo } from "@/components/logo";
import { StatusBadge } from "@/components/status-badge";

/**
 * Split-screen layout for sign-in and onboarding: form on the left,
 * brand panel with a small product preview on the right.
 */
export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1.1fr]">
      <div className="relative flex flex-col px-6 py-8 sm:px-12">
        <div className="pointer-events-none absolute top-0 left-0 h-72 w-72 rounded-full bg-indigo-600/10 blur-[100px]" />
        <Logo className="relative" />
        <div className="relative mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{description}</p>
          <div className="mt-10">{children}</div>
        </div>
        <p className="text-muted-foreground relative text-xs">
          We only use your email to sign you in and notify you about ideas you vote on.
        </p>
      </div>

      <div className="relative m-3 hidden overflow-hidden rounded-3xl border border-white/[0.06] bg-[#0c0a1a] lg:block">
        <div className="bg-lines pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" />
        <div className="pointer-events-none absolute -top-32 -right-20 h-96 w-96 rounded-full bg-violet-600/30 blur-[110px]" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-indigo-600/25 blur-[110px]" />

        <div className="relative flex h-full flex-col justify-center px-14 xl:px-20">
          <p className="max-w-md text-4xl leading-tight font-semibold tracking-tight">
            Let your users tell you <span className="text-gradient">what matters</span>.
          </p>
          <p className="text-muted-foreground mt-5 max-w-md">
            One board for ideas, votes and comments. One roadmap that updates itself.
          </p>

          <div className="mt-14 max-w-md space-y-3">
            {(
              [
                ["Dark mode for the dashboard", 248, "IN_PROGRESS", true],
                ["Slack integration", 191, "PLANNED", false],
                ["Export to CSV", 87, "SHIPPED", false],
              ] as const
            ).map(([title, votes, status, voted], index) => (
              <div
                key={title}
                className="glass gradient-border flex items-center gap-4 rounded-xl p-3"
                style={{ marginLeft: `${index * 1.5}rem` }}
              >
                <span
                  className={
                    voted
                      ? "border-primary/60 bg-primary/15 flex w-11 flex-col items-center rounded-lg border py-1 text-xs font-semibold text-indigo-200 tabular-nums"
                      : "flex w-11 flex-col items-center rounded-lg border bg-black/20 py-1 text-xs font-semibold tabular-nums"
                  }
                >
                  <ChevronUp className="size-3.5" />
                  {votes}
                </span>
                <span className="flex-1 text-sm font-medium">{title}</span>
                <StatusBadge status={status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
