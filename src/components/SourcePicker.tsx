import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Music2, Play } from "lucide-react";

import { ActiveSource, mediaForSource } from "@/lib/sources";
import { pickerSelectionTitle } from "@/lib/picker-labels";
import { SourceLogo } from "@/components/SourceLogo";
import type { MediaResult } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SourcePickerProps {
  catalog: MediaResult[];
  counts: Record<ActiveSource, number>;
  onSelect: (source: ActiveSource, category?: string) => void;
  isLoading?: boolean;
}

interface PickerSlot {
  source: ActiveSource;
  category?: string;
}

/** Music stays first so it occupies the leading row(s) at every column count. */
const MUSIC_SEQUENCE: ReadonlyArray<PickerSlot> = [
  { source: "all", category: "Music" },
  { source: "timelessToday", category: "Music" },
  { source: "youtube", category: "Music" },
];

const REST_SEQUENCE: ReadonlyArray<PickerSlot> = [
  { source: "all", category: "Video" },
  { source: "timelessToday", category: "Video" },
  { source: "youtube", category: "Video" },
  { source: "intelligentExistence" },
  { source: "spotify" },
  { source: "applePodcast" },
];

interface TileTheme {
  iconClass: string;
  shellClass: string;
}

const THEME = {
  teal: {
    iconClass: "text-teal-600 dark:text-teal-300",
    shellClass: "border-teal-500/60 bg-teal-500/20 hover:border-teal-500 hover:bg-teal-500/28",
  },
  amber: {
    iconClass: "text-amber-600 dark:text-amber-300",
    shellClass: "border-amber-500/60 bg-amber-500/20 hover:border-amber-500 hover:bg-amber-500/28",
  },
  // TT diamond is coral/red — tint the tile to match the mark
  rose: {
    iconClass: "text-rose-600 dark:text-rose-300",
    shellClass: "border-rose-500/55 bg-rose-500/18 hover:border-rose-500/90 hover:bg-rose-500/26",
  },
  red: {
    iconClass: "text-red-600 dark:text-red-400",
    shellClass: "border-red-500/60 bg-red-500/18 hover:border-red-500 hover:bg-red-500/26",
  },
  emerald: {
    iconClass: "text-emerald-600 dark:text-emerald-400",
    shellClass:
      "border-emerald-500/60 bg-emerald-500/20 hover:border-emerald-500 hover:bg-emerald-500/28",
  },
  purple: {
    iconClass: "text-purple-600 dark:text-purple-300",
    shellClass:
      "border-purple-500/60 bg-purple-500/20 hover:border-purple-500 hover:bg-purple-500/28",
  },
  sky: {
    iconClass: "text-sky-600 dark:text-sky-300",
    shellClass: "border-sky-500/60 bg-sky-500/20 hover:border-sky-500 hover:bg-sky-500/28",
  },
} satisfies Record<string, TileTheme>;

const SOURCE_THEME: Record<Exclude<ActiveSource, "all">, TileTheme> = {
  timelessToday: THEME.rose,
  youtube: THEME.red,
  intelligentExistence: THEME.sky,
  spotify: THEME.emerald,
  applePodcast: THEME.purple,
};

function tileTheme({ source, category }: PickerSlot): TileTheme {
  if (source === "all") return category === "Music" ? THEME.amber : THEME.teal;
  return SOURCE_THEME[source];
}

interface PickerTile extends PickerSlot {
  key: string;
  count: number;
  title: string;
}

function countFor(
  catalog: MediaResult[],
  counts: Record<ActiveSource, number>,
  { source, category }: PickerSlot,
): number {
  if (!category) return counts[source];
  return mediaForSource(catalog, source).filter((item) => (item.category || "Video") === category)
    .length;
}

function buildTiles(
  sequence: ReadonlyArray<PickerSlot>,
  catalog: MediaResult[],
  counts: Record<ActiveSource, number>,
  isLoading: boolean,
  t: (key: string) => string,
): PickerTile[] {
  return sequence.flatMap((slot) => {
    const count = countFor(catalog, counts, slot);
    if (!isLoading && count === 0) return [];
    return [
      {
        ...slot,
        key: slot.category ? `${slot.source}:${slot.category}` : slot.source,
        count,
        title: pickerSelectionTitle(slot.source, slot.category, t),
      },
    ];
  });
}

function PickerTileButton({
  tile,
  onSelect,
  itemCountLabel,
}: {
  tile: PickerTile;
  onSelect: (source: ActiveSource, category?: string) => void;
  itemCountLabel: string;
}) {
  const { iconClass, shellClass } = tileTheme(tile);
  const CategoryIcon = tile.category === "Music" ? Music2 : Play;

  return (
    <button
      type="button"
      onClick={() => onSelect(tile.source, tile.category)}
      className={cn(
        "group flex flex-col items-center justify-center gap-1.5 rounded-none border-2 px-2 py-2.5 text-foreground transition-all sm:gap-2 sm:px-2.5 sm:py-3",
        "hover:brightness-[0.98] dark:hover:brightness-110 active:translate-y-px",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        shellClass,
      )}
    >
      {/* Logo sits directly on the tinted tile — no white plate behind it */}
      <span className="relative flex size-16 shrink-0 items-center justify-center sm:size-[4.5rem] md:size-[5rem]">
        {tile.source === "all" ? (
          <CategoryIcon className={cn("size-full", iconClass)} strokeWidth={1.55} />
        ) : (
          <>
            <SourceLogo
              source={tile.source}
              className="block size-full"
              imgClassName="size-full object-contain"
            />
            {tile.category && (
              <span
                className={cn(
                  "absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-none border border-current/30 bg-background/80 sm:h-6 sm:w-6",
                  iconClass,
                )}
                aria-hidden
              >
                <CategoryIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" strokeWidth={2.25} />
              </span>
            )}
          </>
        )}
      </span>
      <div className="shrink-0 space-y-0.5 px-0.5 text-center">
        <div className="text-xs font-semibold leading-snug sm:text-sm md:text-base">
          {tile.title}
        </div>
        <div className="text-[11px] text-muted-foreground sm:text-xs">{itemCountLabel}</div>
      </div>
    </button>
  );
}

export function SourcePicker({ catalog, counts, onSelect, isLoading = false }: SourcePickerProps) {
  const { t } = useTranslation();

  const tiles = useMemo(() => {
    const music = buildTiles(MUSIC_SEQUENCE, catalog, counts, isLoading, t);
    const rest = buildTiles(REST_SEQUENCE, catalog, counts, isLoading, t);
    return [...music, ...rest];
  }, [catalog, counts, isLoading, t]);

  return (
    <section className="space-y-2 animate-fade-in" aria-label={t("picker.subtitle")}>
      <p className="text-center text-base text-muted-foreground sm:text-lg">
        {t("picker.subtitle")}
      </p>

      {/*
        Step columns as width shrinks:
        3-col ≥768 (iPad / iPad Pro portrait+) → 2-col 480–767 → 1-col <480.
        Natural row height (no viewport stretch) so the page fits a laptop screen.
      */}
      <div
        className={cn(
          "grid gap-2 sm:gap-2.5",
          "grid-cols-1",
          "min-[480px]:grid-cols-2",
          "min-[768px]:grid-cols-3",
        )}
      >
        {tiles.map((tile) => (
          <PickerTileButton
            key={tile.key}
            tile={tile}
            onSelect={onSelect}
            itemCountLabel={t("picker.itemCount", { count: tile.count })}
          />
        ))}
      </div>
    </section>
  );
}
