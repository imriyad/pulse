import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Mail } from "lucide-react";
import { signIn } from "@/auth";
import { githubAuthEnabled } from "@/lib/env";
import { safeCallbackUrl } from "@/lib/safe-redirect";
import { getCurrentUser } from "@/server/session";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = { title: "Sign in" };

type Props = { searchParams: Promise<{ callbackUrl?: string; error?: string }> };

export default async function SignInPage({ searchParams }: Props) {
  const { callbackUrl, error } = await searchParams;
  const redirectTo = safeCallbackUrl(callbackUrl);

  if (await getCurrentUser()) redirect(redirectTo);

  return (
    <AuthShell
      title="Welcome to Pulse"
      description="Sign in or create an account. We'll email you a magic link, no password needed."
    >
      {error && (
        <p
          role="alert"
          className="border-destructive/30 bg-destructive/5 text-destructive mb-4 rounded-lg border px-3 py-2 text-sm"
        >
          Sign-in failed. Please try again.
        </p>
      )}

      {githubAuthEnabled && (
        <>
          <form
            action={async () => {
              "use server";
              await signIn("github", { redirectTo });
            }}
          >
            <Button type="submit" variant="outline" className="h-10 w-full">
              <GitHubIcon /> Continue with GitHub
            </Button>
          </form>
          <div className="text-muted-foreground my-6 flex items-center gap-3 text-xs uppercase">
            <span className="bg-border h-px flex-1" /> or <span className="bg-border h-px flex-1" />
          </div>
        </>
      )}

      <form
        className="flex flex-col gap-3"
        action={async (formData) => {
          "use server";
          await signIn("nodemailer", { email: formData.get("email"), redirectTo });
        }}
      >
        <Label htmlFor="email">Work email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@company.com"
          className="h-10"
        />
        <Button type="submit" className="glow-primary mt-1 h-10">
          <Mail /> Email me a sign-in link
        </Button>
      </form>
    </AuthShell>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="size-4">
      <path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.4-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}
