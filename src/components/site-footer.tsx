import { Logo } from "@/components/logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.06]">
      <div className="text-muted-foreground mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-10 text-sm sm:flex-row sm:px-6">
        <Logo />
        <p>Built with Next.js, Prisma and Postgres. © {new Date().getFullYear()} Pulse.</p>
      </div>
    </footer>
  );
}
