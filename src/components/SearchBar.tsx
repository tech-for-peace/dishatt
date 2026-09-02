import { useEffect, useId, useRef, useState } from "react";
import { RefreshCw, Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import type { SearchSuggestion, SuggestionKind } from "@/lib/suggestions";

interface SearchToken {
  id: string;
  label: string;
  onRemove: () => void;
}

interface SearchBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  tokens: SearchToken[];
  suggestions: SearchSuggestion[];
  onSelectSuggestion: (suggestion: SearchSuggestion) => void;
  onSubmitQuery: (value: string) => void;
  onResetFilters?: () => void;
  canReset?: boolean;
}

const KIND_LABEL: Record<SuggestionKind, string> = {
  channel: "filters.suggestionChannel",
  tag: "filters.suggestionTag",
  year: "filters.suggestionYear",
  category: "filters.suggestionCategory",
  language: "filters.suggestionLanguage",
  duration: "filters.suggestionDuration",
};

export function SearchBar({
  query,
  onQueryChange,
  tokens,
  suggestions,
  onSelectSuggestion,
  onSubmitQuery,
  onResetFilters,
  canReset = false,
}: SearchBarProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const activeIndex =
    suggestions.length === 0 ? 0 : Math.min(highlight, suggestions.length - 1);

  const showList = open && suggestions.length > 0;

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const commit = () => {
    if (showList && suggestions[activeIndex]) {
      onSelectSuggestion(suggestions[activeIndex]);
      setOpen(false);
      return;
    }
    const trimmed = query.trim();
    if (trimmed) {
      onSubmitQuery(trimmed);
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          commit();
        }}
      >
        <div
          className={cn(
            "flex min-h-12 items-start gap-2 rounded-xl border bg-white/95 px-3 py-1.5 sm:min-h-10 sm:items-center sm:py-0 dark:bg-white/10 dark:text-white",
            "border-white/30 focus-within:border-white/60 focus-within:ring-2 focus-within:ring-white/25",
          )}
        >
          <Search
            className="mt-2.5 h-4 w-4 shrink-0 text-muted-foreground sm:mt-0"
            aria-hidden="true"
          />
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
            {tokens.map((token) => (
              <span
                key={token.id}
                className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary py-1 pl-2.5 pr-1 text-sm font-medium text-primary-foreground"
              >
                <span className="truncate">{token.label}</span>
                <button
                  type="button"
                  onClick={token.onRemove}
                  className="rounded-full p-0.5 text-primary-foreground/80 hover:bg-primary-foreground/20 hover:text-primary-foreground"
                  aria-label={t("filters.removeToken", { token: token.label })}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => {
                onQueryChange(event.target.value);
                setHighlight(0);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setOpen(true);
                  setHighlight((index) =>
                    suggestions.length === 0
                      ? 0
                      : (index + 1) % suggestions.length,
                  );
                } else if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setHighlight((index) =>
                    suggestions.length === 0
                      ? 0
                      : (index - 1 + suggestions.length) % suggestions.length,
                  );
                } else if (event.key === "Escape") {
                  setOpen(false);
                }
              }}
              placeholder={
                tokens.length === 0
                  ? t("filters.searchPlaceholder")
                  : t("filters.searchMore")
              }
              className="min-w-[8rem] flex-1 bg-transparent py-2.5 text-base text-foreground outline-none placeholder:text-muted-foreground sm:py-2 sm:text-sm"
              role="combobox"
              aria-expanded={showList}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={
                showList ? `${listId}-${activeIndex}` : undefined
              }
              inputMode="search"
              enterKeyHint="search"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
          </div>
          {query.length > 0 && (
            <button
              type="button"
              onClick={() => {
                onQueryChange("");
                inputRef.current?.focus();
              }}
              className="mt-0.5 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground sm:mt-0"
              aria-label={t("filters.clearQuery")}
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {onResetFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              disabled={!canReset}
              aria-label={t("filters.reset")}
              className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center gap-1 rounded-full text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40 sm:mt-0 sm:w-auto sm:px-2"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t("filters.reset")}</span>
            </button>
          )}
        </div>
      </form>
      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-[calc(100%+6px)] z-40 overflow-hidden rounded-2xl border border-border bg-card py-1 shadow-card"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={`${suggestion.kind}-${suggestion.value}`}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === activeIndex}
            >
              <button
                type="button"
                onMouseEnter={() => setHighlight(index)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onSelectSuggestion(suggestion);
                  setOpen(false);
                  inputRef.current?.focus();
                }}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-left text-sm",
                  index === activeIndex ? "bg-primary/10" : "hover:bg-muted/60",
                )}
              >
                <span className="w-20 shrink-0 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t(KIND_LABEL[suggestion.kind])}
                </span>
                <span className="truncate font-medium text-foreground">
                  {suggestion.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
