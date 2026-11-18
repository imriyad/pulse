"use client";

import { useState, useTransition } from "react";
import { ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleVoteAction } from "./actions";

type Props = { slug: string; feedbackId: string; voted: boolean; voteCount: number };

export function VoteButton({
  slug,
  feedbackId,
  voted: initialVoted,
  voteCount: initialCount,
}: Props) {
  const [state, setState] = useState({ voted: initialVoted, count: initialCount });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onClick() {
    const previous = state;
    // Optimistic update; rolled back if the server says no.
    setState({ voted: !previous.voted, count: previous.count + (previous.voted ? -1 : 1) });
    setError(null);
    startTransition(async () => {
      const result = await toggleVoteAction(slug, feedbackId);
      if (result.ok) setState({ voted: result.data.voted, count: result.data.voteCount });
      else {
        setState(previous);
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        aria-pressed={state.voted}
        aria-label={state.voted ? "Remove your vote" : "Vote for this idea"}
        className={cn(
          "flex w-12 flex-col items-center rounded-lg border py-1.5 text-sm font-semibold transition-colors",
          state.voted
            ? "border-primary bg-primary text-primary-foreground"
            : "bg-background hover:border-primary/50",
        )}
      >
        <ChevronUp className="size-4" />
        {state.count}
      </button>
      {error && (
        <p role="alert" className="text-destructive mt-1 max-w-32 text-center text-xs">
          {error}
        </p>
      )}
    </div>
  );
}
