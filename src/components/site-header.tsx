import Link from "next/link";
import { signOut } from "@/auth";
import { getCurrentUser } from "@/server/session";
import { Logo } from "@/components/logo";
import { UserAvatar } from "@/components/user-avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#widget", label: "Widget" },
];

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="bg-background/60 sticky top-0 z-40 border-b border-white/[0.06] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
        <Logo />
        <nav className="text-muted-foreground hidden items-center gap-6 text-sm md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link href="/dashboard" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                Dashboard
              </Link>
              <UserAvatar name={user.name} email={user.email} image={user.image} />
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <Button type="submit" variant="outline" size="sm">
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/signin" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                Sign in
              </Link>
              <Link href="/new" className={cn(buttonVariants({ size: "sm" }), "glow-primary")}>
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
