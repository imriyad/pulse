"use client";

import { useActionState, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { slugify } from "@/lib/validation/workspace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { createWorkspaceAction } from "./actions";

export function CreateWorkspaceForm() {
  const [state, formAction, pending] = useActionState(createWorkspaceAction, null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);

  const errors = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Workspace name</Label>
        <Input
          id="name"
          name="name"
          required
          placeholder="Acme Inc."
          className="h-10"
          value={name}
          aria-invalid={Boolean(errors?.name)}
          onChange={(e) => {
            setName(e.target.value);
            if (!slugEdited) setSlug(slugify(e.target.value));
          }}
        />
        <FieldError messages={errors?.name} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="slug">Board URL</Label>
        <div
          className={cn(
            "border-input focus-within:border-ring focus-within:ring-ring/50 flex h-10 items-center overflow-hidden rounded-lg border text-sm focus-within:ring-3",
            errors?.slug && "border-destructive",
          )}
        >
          <span className="bg-muted text-muted-foreground flex h-full items-center border-r px-3">
            pulse.app/
          </span>
          <input
            id="slug"
            name="slug"
            required
            placeholder="acme"
            className="h-full flex-1 bg-transparent px-3 outline-none"
            value={slug}
            aria-invalid={Boolean(errors?.slug)}
            aria-describedby="slug-help"
            onChange={(e) => {
              setSlugEdited(true);
              setSlug(e.target.value.toLowerCase());
            }}
          />
        </div>
        <p id="slug-help" className="text-muted-foreground text-xs">
          Lowercase letters, numbers and hyphens. Your public board lives here.
        </p>
        <FieldError messages={errors?.slug} />
      </div>

      {state && !state.ok && !errors && (
        <p role="alert" className="text-destructive text-sm">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="glow-primary h-10">
        {pending ? (
          <>
            <Loader2 className="animate-spin" /> Creating…
          </>
        ) : (
          <>
            Create workspace <ArrowRight />
          </>
        )}
      </Button>
    </form>
  );
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return (
    <p role="alert" className="text-destructive text-sm">
      {messages[0]}
    </p>
  );
}
