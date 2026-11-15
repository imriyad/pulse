import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { db } from "@/server/db/client";
import { listUserWorkspaces } from "@/server/services/workspace";
import { requireUser } from "@/server/session";

export const metadata: Metadata = { title: "Your workspaces" };

export default async function DashboardIndexPage() {
  const user = await requireUser("/dashboard");
  const memberships = await listUserWorkspaces(db, user.id);

  if (memberships.length === 0) redirect("/new");
  if (memberships.length === 1) redirect(`/dashboard/${memberships[0]!.workspace.slug}`);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Your workspaces</h1>
          <Link href="/new" className={buttonVariants({ variant: "outline", size: "sm" })}>
            New workspace
          </Link>
        </div>
        <ul className="divide-y rounded-lg border">
          {memberships.map(({ workspace, role }) => (
            <li key={workspace.slug}>
              <Link
                href={`/dashboard/${workspace.slug}`}
                className="hover:bg-muted flex items-center justify-between px-4 py-3"
              >
                <span className="font-medium">{workspace.name}</span>
                <Badge variant="secondary">{role.toLowerCase()}</Badge>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
