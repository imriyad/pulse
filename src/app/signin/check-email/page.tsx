import type { Metadata } from "next";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { Logo } from "@/components/logo";

export const metadata: Metadata = { title: "Check your email" };

export default function CheckEmailPage() {
  return (
    <main className="bg-grid relative flex min-h-dvh flex-col items-center justify-center px-4">
      <div className="bg-card w-full max-w-md rounded-2xl border p-8 text-center shadow-xl">
        <div className="flex justify-center">
          <Logo />
        </div>
        <span className="bg-accent text-primary mx-auto mt-8 flex size-14 items-center justify-center rounded-full">
          <MailCheck className="size-7" />
        </span>
        <h1 className="mt-6 text-2xl font-bold tracking-tight">Check your inbox</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          We sent you a sign-in link. It expires in 24 hours. You can close this tab.
        </p>
        {process.env.NODE_ENV === "development" && (
          <a
            href="http://localhost:8025"
            target="_blank"
            rel="noreferrer"
            className="text-primary mt-6 inline-block text-sm font-medium underline-offset-4 hover:underline"
          >
            Open Mailpit (dev inbox) →
          </a>
        )}
        <p className="text-muted-foreground mt-6 text-xs">
          Wrong address?{" "}
          <Link href="/signin" className="text-foreground underline underline-offset-4">
            Try again
          </Link>
        </p>
      </div>
    </main>
  );
}
