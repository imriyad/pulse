"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Code2,
  LayoutDashboard,
  Map,
  MessageSquareText,
  Settings,
  Tags,
  Users,
  Webhook,
} from "lucide-react";
import { cn } from "@/lib/utils";

/** Sections still to be built are shown but marked "Soon" so the shell feels complete. */
const ITEMS = [
  { href: "", label: "Overview", icon: LayoutDashboard },
  { href: "/feedback", label: "Feedback", icon: MessageSquareText, soon: true },
  { href: "/roadmap", label: "Roadmap", icon: Map, soon: true },
  { href: "/analytics", label: "Analytics", icon: BarChart3, soon: true },
  { href: "/tags", label: "Tags", icon: Tags, soon: true },
  { href: "/widget", label: "Widget", icon: Code2, soon: true },
  { href: "/webhooks", label: "Webhooks", icon: Webhook, soon: true },
  { href: "/members", label: "Members", icon: Users, soon: true },
  { href: "/settings", label: "Settings", icon: Settings, soon: true },
];

export function DashboardNav({
  slug,
  orientation = "vertical",
}: {
  slug: string;
  orientation?: "vertical" | "horizontal";
}) {
  const pathname = usePathname();
  const base = `/dashboard/${slug}`;
  const horizontal = orientation === "horizontal";

  return (
    <nav
      className={cn(
        horizontal
          ? "bg-background flex gap-1 overflow-x-auto border-b px-2 py-2"
          : "flex flex-col gap-0.5 p-3",
      )}
    >
      {ITEMS.map(({ href, label, icon: Icon, soon }) => {
        const target = base + href;
        const active = href === "" ? pathname === base : pathname.startsWith(target);
        const classes = cn(
          "flex shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          active
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
          soon && "pointer-events-none opacity-60",
        );

        if (soon) {
          return (
            <span key={label} className={classes} aria-disabled>
              <Icon className="size-4" />
              {label}
              {!horizontal && (
                <span className="bg-muted ml-auto rounded px-1.5 py-0.5 text-[10px] tracking-wide uppercase">
                  Soon
                </span>
              )}
            </span>
          );
        }

        return (
          <Link
            key={label}
            href={target}
            className={classes}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
