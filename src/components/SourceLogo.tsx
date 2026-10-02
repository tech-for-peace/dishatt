import { SOURCE_VISUAL, type SourceVisual } from "@/lib/source-visuals";
import type { SourceKey } from "@/lib/sources";
import { cn } from "@/lib/utils";

interface SourceLogoProps {
  source: SourceKey;
  className?: string;
  imgClassName?: string;
}

/** Renders a source brand mark. */
export function SourceLogo({ source, className, imgClassName }: SourceLogoProps) {
  const visual: SourceVisual = SOURCE_VISUAL[source];

  if (visual.kind === "icon") {
    return <visual.Icon className={cn(className, imgClassName)} />;
  }

  return (
    <img
      src={visual.src}
      alt=""
      className={cn("object-contain", className, imgClassName)}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
    />
  );
}
