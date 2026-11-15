"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/** Copies `value` (resolved against the current origin if it starts with "/"). */
export function CopyButton({ value, label = "Copy link" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const text = value.startsWith("/") ? window.location.origin + value : value;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be blocked (permissions, insecure context); nothing useful to do.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={label}
      className="text-muted-foreground hover:text-foreground shrink-0 transition-colors"
    >
      {copied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
    </button>
  );
}
