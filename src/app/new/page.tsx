import type { Metadata } from "next";
import { AuthShell } from "@/components/auth-shell";
import { requireUser } from "@/server/session";
import { CreateWorkspaceForm } from "./create-workspace-form";

export const metadata: Metadata = { title: "New workspace" };

export default async function NewWorkspacePage() {
  await requireUser("/new");

  return (
    <AuthShell
      title="Create your workspace"
      description="A workspace holds your feedback board, roadmap and team. You'll be its owner and can invite teammates later."
    >
      <CreateWorkspaceForm />
    </AuthShell>
  );
}
