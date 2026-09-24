import { FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { fetchTopStats, TopStatsItem } from "@/lib/data";
import i18n from "@/lib/i18n";

const DEFAULT_N = 20;
const DEFAULT_HOURS = 24;
const MIN_N = 1;
const MAX_N = 100;
const MIN_HOURS = 1;
const MAX_HOURS = 168;

function clampParam(value: number, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  const truncated = Math.trunc(value);
  if (truncated < min) return min;
  if (truncated > max) return max;
  return truncated;
}

interface StatsQuery {
  n: number;
  hours: number;
  seq: number;
}

export default function Stats() {
  // Stats UI is English-only; fixedT ignores the app's hi default.
  const t = i18n.getFixedT("en");

  const [nInput, setNInput] = useState(String(DEFAULT_N));
  const [hoursInput, setHoursInput] = useState(String(DEFAULT_HOURS));
  const [query, setQuery] = useState<StatsQuery>({
    n: DEFAULT_N,
    hours: DEFAULT_HOURS,
    seq: 0,
  });
  const [items, setItems] = useState<TopStatsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const result = await fetchTopStats(query.n, query.hours);
        if (cancelled) return;
        setItems(result.items);
        setNInput(String(result.n));
        setHoursInput(String(result.hours));
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

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const n = clampParam(Number(nInput), MIN_N, MAX_N, DEFAULT_N);
    const hours = clampParam(Number(hoursInput), MIN_HOURS, MAX_HOURS, DEFAULT_HOURS);
    setNInput(String(n));
    setHoursInput(String(hours));
    setLoading(true);
    setQuery((prev) => ({ n, hours, seq: prev.seq + 1 }));
  };

  return (
    <div className="min-h-screen bg-background text-foreground" lang="en">
      <div className="absolute top-3 right-2 z-30 md:top-4 md:right-4">
        <DarkModeToggle />
      </div>

      <main className="mx-auto max-w-3xl px-4 py-10 md:py-14">
        <h1 className="font-heading text-3xl tracking-tight md:text-4xl">{t("stats.title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("stats.summary", { n: query.n, count: query.hours })}
        </p>

        <form onSubmit={onSubmit} className="mt-8 flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-muted-foreground">{t("stats.topN")}</span>
            <Input
              type="number"
              min={MIN_N}
              max={MAX_N}
              value={nInput}
              onChange={(e) => setNInput(e.target.value)}
              className="w-24"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-muted-foreground">{t("stats.hours")}</span>
            <Input
              type="number"
              min={MIN_HOURS}
              max={MAX_HOURS}
              value={hoursInput}
              onChange={(e) => setHoursInput(e.target.value)}
              className="w-24"
            />
          </label>
          <Button type="submit" disabled={loading}>
            {loading ? t("stats.loading") : t("stats.apply")}
          </Button>
        </form>

        {loadFailed && (
          <p className="mt-6 text-sm text-destructive" role="alert">
            {t("stats.loadError")}
          </p>
        )}

        {!loadFailed && !loading && items.length === 0 && (
          <p className="mt-6 text-sm text-muted-foreground">{t("stats.empty")}</p>
        )}

        {items.length > 0 && (
          <ol className="mt-8 space-y-3">
            {items.map((item, index) => (
              <li
                key={item.mediaId}
                className="flex items-center gap-3 border-b border-border/60 pb-3 last:border-0"
              >
                <span className="w-8 shrink-0 text-right text-sm tabular-nums text-muted-foreground">
                  {index + 1}
                </span>
                {item.thumbnail ? (
                  <img src={item.thumbnail} alt="" className="h-12 w-20 shrink-0 object-cover" />
                ) : (
                  <div className="h-12 w-20 shrink-0 bg-muted" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.title ?? item.mediaId}</p>
                  {item.title && (
                    <p className="truncate text-xs text-muted-foreground">{item.mediaId}</p>
                  )}
                </div>
                <span className="shrink-0 text-sm tabular-nums font-medium">{item.clicks}</span>
              </li>
            ))}
          </ol>
        )}
      </main>
    </div>
  );
}
