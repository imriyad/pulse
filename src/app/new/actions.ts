"use server";

import { redirect } from "next/navigation";
import { db } from "@/server/db/client";
import { createWorkspace } from "@/server/services/workspace";
import { requireUser } from "@/server/session";
import type { ActionResult } from "@/lib/action-result";

export async function createWorkspaceAction(
  _prev: ActionResult<{ slug: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ slug: string }>> {
  const user = await requireUser("/new");

  const result = await createWorkspace(db, user.id, {
    name: formData.get("name"),
    slug: formData.get("slug"),
  });

  if (result.ok) redirect(`/dashboard/${result.data.slug}`);
  return result;
}
