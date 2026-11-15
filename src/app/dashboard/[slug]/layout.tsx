import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { signOut } from "@/auth";
import { LogoMark } from "@/components/logo";
import { UserAvatar } from "@/components/user-avatar";
import { requireWorkspaceAccess } from "@/server/session";
import { DashboardNav } from "./dashboard-nav";

type Props = { children: React.ReactNode; params: Promise<{ slug: string }> };

export default async function DashboardLayout({ children, params }: Props) {
  const { slug } = await params;
  const { workspace, role, user } = await requireWorkspaceAccess(slug);

  return (
    <div className="bg-background flex min-h-dvh">
      <aside className="bg-sidebar sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r md:flex">
        <div className="flex h-16 items-center gap-3 border-b px-4">
          <LogoMark />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{workspace.name}</p>
            <p className="text-muted-foreground text-xs capitalize">{role.toLowerCase()}</p>
          </div>
        </div>

        <DashboardNav slug={workspace.slug} />

        <div className="mt-auto border-t p-3">
          <Link
            href={`/${workspace.slug}`}
            target="_blank"
            className="text-muted-foreground hover:bg-muted hover:text-foreground mb-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
          >
            <ExternalLink className="size-4" /> View public board
          </Link>
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <UserAvatar name={user.name} email={user.email} image={user.image} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user.name ?? user.email}</p>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="text-muted-foreground hover:text-foreground text-xs"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="bg-background flex h-14 items-center gap-3 border-b px-4 md:hidden">
          <LogoMark className="size-7" />
          <span className="truncate text-sm font-semibold">{workspace.name}</span>
        </header>
        <div className="md:hidden">
          <DashboardNav slug={workspace.slug} orientation="horizontal" />
        </div>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
