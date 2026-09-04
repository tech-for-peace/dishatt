import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { MediaResult } from "@/lib/types";
import { UI_CONFIG } from "@/lib/constants";
import { MediaCard } from "./MediaCard";

// Sized so the next card always visibly runs past the right edge, which is
// what tells the user the row scrolls. Phones get fewer, larger cards so the
// thumbnails and titles stay readable rather than turning into a dense strip.
const CARD_SIZER_CLASS =
  "shrink-0 snap-start basis-[52%] sm:basis-[29%] lg:basis-[22.4%] xl:basis-[18%]";

const TRACK_CLASS =
  "flex gap-3 overflow-x-auto overscroll-x-contain snap-x snap-mandatory scroll-smooth no-scrollbar pb-1";

const SKELETON_COUNT = 5;

interface MediaRowProps {
  title: string;
  items: MediaResult[];
  isLoading?: boolean;
  pills?: ReactNode;
}

export function MediaRow({ title, items, isLoading, pills }: MediaRowProps) {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(UI_CONFIG.rowInitialCount);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Start the rail over whenever the filters produce a different set of items.
  const [renderedItems, setRenderedItems] = useState(items);
  if (renderedItems !== items) {
    setRenderedItems(items);
    setVisibleCount(UI_CONFIG.rowInitialCount);
  }

  const hasMore = visibleCount < items.length;
  const isEmpty = !isLoading && items.length === 0;

  useEffect(() => {
    scrollRef.current?.scrollTo({ left: 0 });
  }, [items]);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    updateScrollState();
    window.addEventListener("resize", updateScrollState);
    return () => window.removeEventListener("resize", updateScrollState);
  }, [updateScrollState, visibleCount, items, isLoading]);

  // Append the next page once the end of the track scrolls into view.
  useEffect(() => {
    if (!hasMore) return;
    const sentinel = sentinelRef.current;
    const root = scrollRef.current;
    if (!sentinel || !root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) =>
            Math.min(prev + UI_CONFIG.rowPageSize, items.length),
          );
        }
      },
      { root, rootMargin: "0px 400px 0px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, items.length, visibleCount]);

  const scrollByPage = (direction: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: "smooth" });
  };

  return (
    <section className="space-y-1.5">
      <div className="flex items-center gap-2">
        <h2 className="font-heading text-xl md:text-2xl font-semibold text-foreground">
          {title}
        </h2>
        {!isLoading && (
          <span className="rounded-full bg-muted/60 px-2.5 py-0.5 text-sm font-medium text-foreground/70">
            {items.length}
          </span>
        )}
      </div>

      {pills}

      {isEmpty ? (
        <div className="flex min-h-[64px] items-center rounded-xl border border-dashed border-border/60 px-4 text-sm text-muted-foreground">
          {t("rows.empty")}
        </div>
      ) : (
        <div className="group/rail relative">
          <div
            ref={scrollRef}
            onScroll={updateScrollState}
            className={TRACK_CLASS}
            role="region"
            aria-label={title}
          >
            {isLoading
              ? Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                  <div key={i} className={CARD_SIZER_CLASS}>
                    <div className="bg-card rounded-xl overflow-hidden shadow-soft border border-border animate-pulse">
                      <div className="aspect-video bg-muted" />
                      <div className="p-3 space-y-2 h-[72px] sm:h-[80px] md:h-[84px]">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  </div>
                ))
              : items.slice(0, visibleCount).map((item, index) => (
                  <div key={item.id} className={CARD_SIZER_CLASS}>
                    <MediaCard media={item} index={index} />
                  </div>
                ))}
            {hasMore && <div ref={sentinelRef} className="w-px shrink-0" />}
          </div>

          {/* Edge fades: the cards visibly dissolve into the page margin, so
              there is a scroll cue on touch screens where the chevrons are
              hidden. They track scroll position and vanish at each end. */}
          {canScrollLeft && (
            <div className="pointer-events-none absolute inset-y-0 left-0 z-[5] w-6 bg-gradient-to-r from-background to-transparent" />
          )}
          {canScrollRight && (
            <div className="pointer-events-none absolute inset-y-0 right-0 z-[5] w-8 bg-gradient-to-l from-background to-transparent" />
          )}

          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scrollByPage(-1)}
              aria-label={t("rows.scrollLeft")}
              className="hidden md:flex absolute left-0 top-0 bottom-0 z-10 w-10 items-center justify-center rounded-l-xl bg-background/80 text-foreground opacity-0 shadow-soft backdrop-blur-sm transition-opacity duration-200 group-hover/rail:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => scrollByPage(1)}
              aria-label={t("rows.scrollRight")}
              className="hidden md:flex absolute right-0 top-0 bottom-0 z-10 w-10 items-center justify-center rounded-r-xl bg-background/80 text-foreground opacity-0 shadow-soft backdrop-blur-sm transition-opacity duration-200 group-hover/rail:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>
      )}
    </section>
  );
}
