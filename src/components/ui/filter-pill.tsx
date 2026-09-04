import * as React from "react";
import { cn } from "@/lib/utils";

export interface FilterPillProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

export const FilterPill = React.forwardRef<HTMLButtonElement, FilterPillProps>(
  ({ className, selected = false, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      aria-pressed={selected}
      className={cn(
        "inline-flex h-8 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-sm font-medium transition-colors active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        selected
          ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
          : "border-border/60 bg-muted/50 text-foreground/80 hover:border-primary/40 hover:bg-muted hover:text-foreground",
        className,
      )}
      {...props}
    />
  ),
);
FilterPill.displayName = "FilterPill";
