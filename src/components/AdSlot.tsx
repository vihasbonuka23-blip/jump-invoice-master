import { MONETAG_LINK } from "@/lib/invoice";
import { Sparkles } from "lucide-react";

export function AdSlot({ label = "Sponsored" }: { label?: string }) {
  return (
    <a
      href={MONETAG_LINK}
      target="_blank"
      rel="noopener sponsored"
      className="no-print block rounded-xl border border-dashed border-border bg-secondary/60 px-4 py-3 text-center transition-colors hover:bg-secondary"
    >
      <span className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        <Sparkles className="size-3.5" /> {label}
      </span>
      <span className="mt-1 block text-sm font-medium text-primary">
        Free plan is ad supported — tap to support JumpInvoice, or go Pro to remove ads.
      </span>
    </a>
  );
}
