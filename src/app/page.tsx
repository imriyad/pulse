import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Check,
  Code2,
  Map,
  MailCheck,
  ShieldCheck,
  ThumbsUp,
  Webhook,
} from "lucide-react";
import type { FeedbackStatus } from "@prisma/client";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StatusBadge } from "@/components/status-badge";
import { BoardPreview } from "@/components/marketing/board-preview";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: ThumbsUp,
    title: "Public feedback board",
    body: "Users submit ideas, upvote once each and discuss. Search, filter and sort to find what matters.",
    accent: "from-indigo-500/20 text-indigo-300",
  },
  {
    icon: Map,
    title: "A roadmap people follow",
    body: "Move ideas through Planned, In progress and Shipped. The public roadmap updates itself.",
    accent: "from-sky-500/20 text-sky-300",
  },
  {
    icon: Code2,
    title: "Embeddable widget",
    body: "One script tag adds a feedback button to any site. Submissions land in your moderation queue.",
    accent: "from-violet-500/20 text-violet-300",
  },
  {
    icon: Webhook,
    title: "Signed webhooks",
    body: "HMAC-signed payloads on every status change, with automatic retries and a delivery log.",
    accent: "from-fuchsia-500/20 text-fuchsia-300",
  },
  {
    icon: MailCheck,
    title: "Close the loop by email",
    body: "Everyone who voted hears about it the moment their idea is planned or shipped.",
    accent: "from-emerald-500/20 text-emerald-300",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    body: "Top requests, votes over time and status breakdowns, so you prioritise with data.",
    accent: "from-amber-500/20 text-amber-300",
  },
];

const STEPS = [
  {
    title: "Create a workspace",
    body: "Pick a name and a URL. Your public board is live at pulse.app/your-slug.",
  },
  {
    title: "Collect and vote",
    body: "Share the board or embed the widget. Merge duplicates, filter out spam.",
  },
  {
    title: "Ship and announce",
    body: "Change the status. Voters get an email, your systems get a webhook.",
  },
];

const ROADMAP: { status: FeedbackStatus; items: string[] }[] = [
  { status: "PLANNED", items: ["Slack integration", "Custom domains", "SSO login"] },
  { status: "IN_PROGRESS", items: ["Dark mode", "Public changelog"] },
  { status: "SHIPPED", items: ["CSV export", "Email digests", "Tags & filters"] },
];

const METRICS = [
  ["1 vote", "per user, enforced in the database"],
  ["< 5 min", "from signup to a live board"],
  ["HMAC", "SHA-256 signed webhooks"],
  ["100%", "tenant-scoped queries"],
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="overflow-hidden">
        {/* Hero */}
        <section className="relative">
          <div className="bg-lines pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]" />
          <div className="pointer-events-none absolute top-[-18rem] left-1/2 h-[36rem] w-[72rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,oklch(0.55_0.22_278/0.45),transparent)] blur-2xl" />
          <div className="pointer-events-none absolute top-[2rem] left-[15%] h-72 w-72 rounded-full bg-fuchsia-600/20 blur-[100px]" />
          <div className="pointer-events-none absolute top-[6rem] right-[12%] h-72 w-72 rounded-full bg-sky-500/15 blur-[100px]" />

          <div className="relative mx-auto max-w-6xl px-4 pt-20 pb-20 text-center sm:px-6 sm:pt-28">
            <Link
              href="#features"
              className="group text-muted-foreground mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] py-1 pr-3 pl-1 text-xs font-medium backdrop-blur transition-colors hover:border-white/20 hover:text-white"
            >
              <span className="bg-primary/20 rounded-full px-2 py-0.5 text-indigo-200">New</span>
              Feedback → Roadmap → Shipped
              <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
            </Link>

            <h1 className="mx-auto max-w-4xl text-5xl leading-[1.05] font-semibold tracking-tighter text-balance sm:text-7xl">
              <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                Build what your users
              </span>{" "}
              <span className="text-gradient">actually want</span>
            </h1>

            <p className="text-muted-foreground mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-balance">
              A public feedback board with upvotes, a live roadmap, an embeddable widget and signed
              webhooks. Every idea gets a home, and every user hears when it ships.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/new"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "glow-primary h-11 px-6 text-base hover:brightness-110",
                )}
              >
                Create your workspace <ArrowRight className="ml-1 size-4" />
              </Link>
              <Link
                href="/acme"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-11 border-white/10 bg-white/[0.03] px-6 text-base backdrop-blur hover:bg-white/[0.07]",
                )}
              >
                View demo board
              </Link>
            </div>
            <p className="text-muted-foreground mt-4 text-xs">
              Free while in beta · No credit card
            </p>

            <div className="relative mx-auto mt-20 max-w-5xl text-left">
              <BoardPreview />
            </div>
          </div>
        </section>

        {/* Metrics strip */}
        <section className="border-y border-white/5 bg-white/[0.015]">
          <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-px px-4 sm:px-6 lg:grid-cols-4">
            {METRICS.map(([value, label]) => (
              <div key={label} className="px-4 py-8 text-center">
                <dt className="text-gradient text-2xl font-semibold tracking-tight sm:text-3xl">
                  {value}
                </dt>
                <dd className="text-muted-foreground mt-1 text-sm">{label}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Features */}
        <section
          id="features"
          className="relative mx-auto max-w-6xl scroll-mt-20 px-4 py-28 sm:px-6"
        >
          <SectionHeading
            eyebrow="Everything in one place"
            title="From a stray idea to a shipped feature"
            body="Stop losing feedback across email threads, support tickets and spreadsheets."
          />
          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, body, accent }) => (
              <div
                key={title}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/15 hover:bg-white/[0.04]"
              >
                <div
                  className={cn(
                    "pointer-events-none absolute -top-16 -right-16 size-40 rounded-full bg-gradient-to-br to-transparent opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100",
                    accent,
                  )}
                />
                <span
                  className={cn(
                    "relative inline-flex size-11 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br to-white/[0.02]",
                    accent,
                  )}
                >
                  <Icon className="size-5" />
                </span>
                <h3 className="relative mt-5 font-semibold">{title}</h3>
                <p className="text-muted-foreground relative mt-2 text-sm leading-relaxed">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Roadmap */}
        <section className="relative border-y border-white/5 bg-white/[0.015]">
          <div className="pointer-events-none absolute top-1/2 left-1/2 h-80 w-[50rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/10 blur-[120px]" />
          <div className="relative mx-auto max-w-6xl px-4 py-28 sm:px-6">
            <SectionHeading
              eyebrow="Public roadmap"
              title="Show users their ideas moving"
              body="Statuses flow straight from your dashboard to a roadmap anyone can follow."
            />
            <div className="mt-16 grid gap-4 md:grid-cols-3">
              {ROADMAP.map((column) => (
                <div
                  key={column.status}
                  className="glass rounded-2xl border border-white/[0.06] p-4"
                >
                  <div className="mb-4 flex items-center justify-between px-1">
                    <StatusBadge status={column.status} />
                    <span className="text-muted-foreground text-xs tabular-nums">
                      {column.items.length}
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {column.items.map((item) => (
                      <li
                        key={item}
                        className="rounded-lg border border-white/[0.06] bg-black/20 px-3 py-2.5 text-sm"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="mx-auto max-w-6xl scroll-mt-16 px-4 py-28 sm:px-6">
          <SectionHeading eyebrow="How it works" title="Live in three steps" />
          <ol className="relative mt-16 grid gap-10 md:grid-cols-3 md:gap-6">
            <div className="absolute top-5 right-[16%] left-[16%] hidden h-px bg-gradient-to-r from-transparent via-white/15 to-transparent md:block" />
            {STEPS.map((step, index) => (
              <li key={step.title} className="relative text-center">
                <span className="bg-background relative mx-auto flex size-10 items-center justify-center rounded-full border border-indigo-400/40 text-sm font-semibold text-indigo-200 shadow-[0_0_24px_-4px] shadow-indigo-500/60">
                  {index + 1}
                </span>
                <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
                <p className="text-muted-foreground mx-auto mt-2 max-w-xs text-sm leading-relaxed">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* Widget */}
        <section
          id="widget"
          className="mx-auto grid max-w-6xl scroll-mt-20 items-center gap-16 px-4 pb-28 sm:px-6 lg:grid-cols-2"
        >
          <div>
            <p className="text-sm font-medium text-indigo-300">Embeddable widget</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Collect feedback where your users already are
            </h2>
            <p className="text-muted-foreground mt-4 leading-relaxed">
              Paste one line into your site and a feedback button appears. Lightweight, isolated
              from your styles, and protected by rate limiting and spam checks.
            </p>
            <ul className="mt-8 space-y-3 text-sm">
              {[
                "Restrict submissions to your own domains",
                "New ideas wait in a moderation queue",
                "Links back to your full public board",
              ].map((point) => (
                <li key={point} className="flex items-center gap-3">
                  <span className="flex size-5 items-center justify-center rounded-full bg-indigo-500/15 text-indigo-300">
                    <Check className="size-3" />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative pb-10">
            <div className="gradient-border overflow-hidden rounded-2xl bg-[#0b0b14] shadow-2xl shadow-black/50">
              <div className="flex items-center justify-between border-b border-white/5 px-4 py-2.5 text-xs text-slate-500">
                <span className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-white/10" />
                  <span className="size-2.5 rounded-full bg-white/10" />
                  <span className="size-2.5 rounded-full bg-white/10" />
                  <span className="ml-2">index.html</span>
                </span>
                <ShieldCheck className="size-4" />
              </div>
              <pre className="overflow-x-auto p-6 font-mono text-[13px] leading-relaxed text-slate-300">
                <code>
                  <span className="text-slate-500">{"<!-- Pulse feedback widget -->"}</span>
                  {"\n"}
                  <span className="text-pink-400">{"<script"}</span>
                  {"\n  "}
                  <span className="text-sky-300">src</span>
                  <span className="text-slate-500">=</span>
                  <span className="text-emerald-300">{'"https://pulse.app/widget.js"'}</span>
                  {"\n  "}
                  <span className="text-sky-300">data-workspace</span>
                  <span className="text-slate-500">=</span>
                  <span className="text-emerald-300">{'"acme"'}</span>
                  {"\n  "}
                  <span className="text-sky-300">defer</span>
                  <span className="text-pink-400">{"></script>"}</span>
                </code>
              </pre>
            </div>
            <div className="glass gradient-border absolute right-0 bottom-0 w-64 rounded-xl p-4 sm:-right-4">
              <p className="text-sm font-semibold">Share an idea</p>
              <div className="text-muted-foreground mt-3 rounded-md border bg-black/30 px-2.5 py-1.5 text-xs">
                Bulk edit tasks
              </div>
              <div className="mt-2 h-14 rounded-md border bg-black/30" />
              <div className="bg-primary text-primary-foreground glow-primary mt-3 rounded-md py-1.5 text-center text-xs font-medium">
                Send feedback
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-4 pb-28 sm:px-6">
          <div className="gradient-border relative overflow-hidden rounded-3xl bg-gradient-to-b from-indigo-950/80 to-[#0d0b1d] px-6 py-20 text-center sm:px-16">
            <div className="bg-lines pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
            <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[40rem] -translate-x-1/2 rounded-full bg-indigo-500/30 blur-[90px]" />
            <h2 className="relative text-3xl font-semibold tracking-tight sm:text-5xl">
              Give your users a <span className="text-gradient">voice</span> today
            </h2>
            <p className="text-muted-foreground relative mx-auto mt-5 max-w-xl">
              Set up your board in under a minute. Your first idea could land before your coffee
              cools.
            </p>
            <Link
              href="/new"
              className="relative mt-10 inline-flex h-11 items-center gap-2 rounded-lg bg-white px-6 font-semibold text-slate-900 shadow-[0_0_40px_-8px] shadow-white/40 transition hover:bg-white/90"
            >
              Get started free <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function SectionHeading({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-sm font-medium text-indigo-300">{eyebrow}</p>
      <h2 className="mt-3 bg-gradient-to-b from-white to-white/70 bg-clip-text text-3xl font-semibold tracking-tight text-transparent sm:text-5xl">
        {title}
      </h2>
      {body && <p className="text-muted-foreground mt-5 text-lg">{body}</p>}
    </div>
  );
}
