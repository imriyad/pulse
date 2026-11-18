"use client";

import { useActionState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { HONEYPOT_FIELD } from "@/lib/validation/feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitFeedbackAction } from "./actions";

export function SubmitForm({ slug }: { slug: string }) {
  const [state, formAction, pending] = useActionState(submitFeedbackAction.bind(null, slug), null);
  const formRef = useRef<HTMLFormElement>(null);
  const errors = state && !state.ok ? state.fieldErrors : undefined;

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="mt-4 flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          required
          maxLength={120}
          placeholder="Short summary of your idea"
          aria-invalid={Boolean(errors?.title)}
        />
        {errors?.title && (
          <p role="alert" className="text-destructive text-sm">
            {errors.title[0]}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Details (optional)</Label>
        <textarea
          id="description"
          name="description"
          rows={4}
          maxLength={2000}
          className="border-input focus-visible:border-ring focus-visible:ring-ring/50 rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-3"
          aria-invalid={Boolean(errors?.description)}
        />
        {errors?.description && (
          <p role="alert" className="text-destructive text-sm">
            {errors.description[0]}
          </p>
        )}
      </div>
      {/* Honeypot: hidden from people and assistive tech, tempting to bots. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={HONEYPOT_FIELD}>Leave this empty</label>
        <input id={HONEYPOT_FIELD} name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" />
      </div>
      {state && !state.ok && !errors && (
        <p role="alert" className="text-destructive text-sm">
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p role="status" className="text-sm text-emerald-600">
          Thanks! Your idea is on the board.
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="animate-spin" /> Submitting…
          </>
        ) : (
          "Submit idea"
        )}
      </Button>
    </form>
  );
}
