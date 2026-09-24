import { useEffect, useState } from "react";

import { Slider } from "@/components/ui/slider";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { fetchTopStats, TopStatsItem } from "@/lib/data";
import { cn } from "@/lib/utils";
import i18n from "@/lib/i18n";

const N_OPTIONS = [5, 10, 20, 50, 100] as const;
const DEFAULT_N = 20;
const DEFAULT_START = 24;
const DEFAULT_END = 0;
const MIN_HOURS_AGO = 0;
const MAX_HOURS_AGO = 168; // 7 days
const DAY_TICKS = [0, 1, 2, 3, 4, 5, 6, 7] as const;

type Translate = (key: string, opts?: Record<string, unknown>) => string;

/** Friendly absolute point on the timeline (hours ago → now). */
function pointLabel(hoursAgo: number, t: Translate): string {
  if (hoursAgo <= 0) return t("stats.now");
  if (hoursAgo % 24 === 0) {
    return t("stats.daysAgo", { count: hoursAgo / 24 });
  }
  if (hoursAgo > 48) {
    const days = Math.floor(hoursAgo / 24);
    const hours = hoursAgo % 24;
    return `${t("stats.daysAgo", { count: days })}, ${t("stats.hoursAgo", { count: hours })}`;
  }
  return t("stats.hoursAgo", { count: hoursAgo });
}

/** Window label: "Last 2 days" when ending at now, otherwise a range. */
function windowLabel(start: number, end: number, t: Translate): string {
  const span = start - end;
  if (end === 0) {
    if (span % 24 === 0 && span >= 24) {
      return t("stats.lastDays", { count: span / 24 });
    }
    return t("stats.lastHours", { count: span });
  }
  return t("stats.range", {
    start: pointLabel(start, t),
    end: pointLabel(end, t),
  });
}

interface StatsQuery {
  n: number;
  start: number;
  end: number;
  seq: number;
}

export default function Stats() {
  // Stats UI is English-only; fixedT ignores the app's hi default.
  const t = i18n.getFixedT("en");

  const [range, setRange] = useState<[number, number]>([DEFAULT_END, DEFAULT_START]);
  const [query, setQuery] = useState<StatsQuery>({
    n: DEFAULT_N,
    start: DEFAULT_START,
    end: DEFAULT_END,
    seq: 0,
  });
  const [items, setItems] = useState<TopStatsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const result = await fetchTopStats(query.n, query.start, query.end);
        if (cancelled) return;
        setItems(result.items);
        setRange([result.end, result.start]);
        setLoadFailed(false);
      } catch {
        if (cancelled) return;
        setItems([]);
        setLoadFailed(true);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [query]);

  const applyQuery = (next: { n: number; start: number; end: number }) => {
    setLoading(true);
    setQuery((prev) => ({ ...next, seq: prev.seq + 1 }));
  };

  const onSelectN = (nextN: number) => {
    applyQuery({ n: nextN, start: query.start, end: query.end });
  };

  const onRangeCommit = (value: number[]) => {
    const end = Math.min(value[0] ?? DEFAULT_END, value[1] ?? DEFAULT_START);
    let start = Math.max(value[0] ?? DEFAULT_END, value[1] ?? DEFAULT_START);
    if (start === end) {
      start = Math.min(MAX_HOURS_AGO, end + 1);
    }
    setRange([end, start]);
    applyQuery({ n: query.n, start, end });
  };

  const liveWindow = windowLabel(range[1], range[0], t);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground" lang="en">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-60 bg-hero opacity-90 sm:h-40"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-16 top-8 h-28 w-28 rounded-full bg-secondary/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-10 top-2 h-24 w-24 rounded-full bg-primary-foreground/10 blur-3xl"
        aria-hidden
      />

      <div className="absolute top-2 right-2 z-30">
        <DarkModeToggle />
      </div>

      <main className="relative z-10 mx-auto max-w-3xl px-4 pb-16 pt-3">
        <div className="flex flex-col items-center">
          <header className="animate-fade-in text-center text-white">
            <h1 className="font-heading text-3xl font-semibold tracking-tight">
              {t("stats.title")}
            </h1>
          </header>

          <section
            className="animate-slide-up mt-3 w-full rounded-2xl border border-border/60 bg-card/90 px-3 py-3 shadow-card backdrop-blur-md sm:w-fit sm:px-4"
            style={{ animationDelay: "80ms" }}
          >
            <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:items-start sm:gap-8">
              <div className="min-w-0">
                <div className="mb-2 flex h-4 items-center">
                  <span className="text-xs font-medium uppercase leading-none tracking-wider text-muted-foreground">
                    {t("stats.topN")}
                  </span>
                </div>
                <div
                  className="flex gap-0.5 rounded-xl bg-muted/50 p-1 dark:bg-muted/25"
                  role="group"
                  aria-label={t("stats.topN")}
                >
                  {N_OPTIONS.map((option) => {
                    const selected = query.n === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        disabled={loading}
                        aria-pressed={selected}
                        onClick={() => onSelectN(option)}
                        className={cn(
                          "flex-1 rounded-lg px-2 py-1.5 text-sm font-medium tabular-nums transition-all duration-200 sm:flex-none sm:px-3",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                          "disabled:pointer-events-none disabled:opacity-50",
                          selected
                            ? "bg-background text-foreground shadow-soft"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="min-w-0 sm:w-64">
                <div className="mb-2 flex h-4 min-w-0 items-center justify-between gap-3">
                  <span className="text-xs font-medium uppercase leading-none tracking-wider text-muted-foreground">
                    {t("stats.window")}
                  </span>
                  <span className="truncate text-xs font-medium leading-none text-foreground">
                    {liveWindow}
                  </span>
                </div>
                <Slider
                  min={MIN_HOURS_AGO}
                  max={MAX_HOURS_AGO}
                  step={1}
                  value={range}
                  disabled={loading}
                  onValueChange={(value) => {
                    const end = Math.min(value[0] ?? 0, value[1] ?? 0);
                    const start = Math.max(value[0] ?? 0, value[1] ?? 0);
                    setRange([end, start]);
                  }}
                  onValueCommit={onRangeCommit}
                  aria-label={t("stats.window")}
                  aria-valuetext={liveWindow}
                />
                <div className="pointer-events-none relative h-4">
                  {DAY_TICKS.map((day) => {
                    const pct = (day * 24) / MAX_HOURS_AGO;
                    return (
                      <div
                        key={day}
                        className={cn(
                          "absolute top-0 flex flex-col items-center",
                          day === 0 && "items-start",
                          day === 7 && "-translate-x-full items-end",
                          day > 0 && day < 7 && "-translate-x-1/2",
                        )}
                        style={{ left: `${pct * 100}%` }}
                      >
                        <span className="text-[11px] tabular-nums leading-none text-muted-foreground">
                          {day === 0 ? t("stats.now") : t("stats.dayTick", { count: day })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-4">
          {loadFailed && (
            <p
              className="animate-fade-in rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
              role="alert"
            >
              {t("stats.loadError")}
            </p>
          )}

          {loading && (
            <ul className="space-y-3" aria-busy="true" aria-label={t("stats.loading")}>
              {Array.from({ length: 5 }).map((_, i) => (
                <li
                  key={i}
                  className="flex animate-pulse items-center gap-2 rounded-2xl bg-card/60 p-2.5 sm:gap-4 sm:p-4 md:gap-5 md:p-5"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="h-5 w-6 shrink-0 rounded bg-muted/50 sm:h-6 sm:w-8" />
                  <div className="h-12 w-20 shrink-0 rounded-lg bg-muted/50 sm:h-20 sm:w-36 sm:rounded-xl md:h-24 md:w-40" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-5 w-3/4 max-w-[16rem] rounded bg-muted/50" />
                    <div className="h-3 w-24 rounded bg-muted/40" />
                  </div>
                  <div className="h-8 w-12 rounded bg-muted/50" />
                </li>
              ))}
            </ul>
          )}

          {!loadFailed && !loading && items.length === 0 && (
            <p className="animate-fade-in py-16 text-center text-sm text-muted-foreground">
              {t("stats.empty")}
            </p>
          )}

          {!loading && items.length > 0 && (
            <ol className="space-y-3">
              {items.map((item, index) => {
                const rowClass = cn(
                  "animate-slide-up group flex items-center gap-2 rounded-2xl border border-transparent bg-card/50 p-2.5 transition-colors duration-200 sm:gap-4 sm:p-4 md:gap-5 md:p-5",
                  item.url &&
                    "hover:border-border/60 hover:bg-card hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                );
                const body = (
                  <>
                    <span
                      className={cn(
                        "w-6 shrink-0 text-center font-heading text-xl tabular-nums leading-none sm:w-8 sm:text-2xl md:w-10 md:text-3xl",
                        index === 0
                          ? "font-semibold text-foreground"
                          : "font-medium text-muted-foreground",
                      )}
                    >
                      {index + 1}
                    </span>
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt=""
                        className="h-12 w-20 shrink-0 rounded-lg object-cover shadow-soft transition-transform duration-300 group-hover:scale-[1.02] sm:h-20 sm:w-36 sm:rounded-xl md:h-24 md:w-40"
                      />
                    ) : (
                      <div className="h-12 w-20 shrink-0 rounded-lg bg-muted sm:h-20 sm:w-36 sm:rounded-xl md:h-24 md:w-40" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "truncate text-sm font-medium leading-snug sm:text-base md:text-lg",
                          item.url ? "group-hover:underline group-hover:underline-offset-2" : "",
                          !item.inCatalog && "text-muted-foreground",
                        )}
                      >
                        {item.title ?? item.mediaId}
                      </p>
                      {item.inCatalog && item.title && (
                        <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
                          {item.mediaId}
                        </p>
                      )}
                      {!item.inCatalog && (
                        <p className="mt-1 text-xs font-medium text-amber-700 dark:text-amber-400">
                          {t("stats.missingFromCache")}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-heading text-2xl font-semibold tabular-nums leading-none tracking-tight sm:text-3xl md:text-4xl">
                        {item.clicks}
                      </p>
                      <p className="mt-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
                        {t("stats.clicks")}
                      </p>
                    </div>
                  </>
                );

                return (
                  <li
                    key={item.mediaId}
                    style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
                  >
                    {item.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={rowClass}
                      >
                        {body}
                      </a>
                    ) : (
                      <div className={rowClass}>{body}</div>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      </main>
    </div>
  );
}
