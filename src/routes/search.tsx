import { createFileRoute } from "@tanstack/react-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Search as SearchIcon, X, SlidersHorizontal } from "lucide-react";
import { searchManga } from "@/lib/mangadex";
import { MangaCard, MangaCardSkeleton } from "@/components/MangaCard";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search — AniRead" },
      { name: "description", content: "Search thousands of manga on MangaDex." },
    ],
  }),
  component: SearchPage,
});

const CONTENT_RATINGS = ["safe", "suggestive", "erotica"];
const STATUSES = ["ongoing", "completed", "hiatus", "cancelled"];
const DEMOS = ["shounen", "shoujo", "seinen", "josei"];

function SearchPage() {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [contentRating, setContentRating] = useState<string[]>(["safe", "suggestive"]);
  const [status, setStatus] = useState<string[]>([]);
  const [demographic, setDemographic] = useState<string[]>([]);
  const [year, setYear] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 350);
    return () => clearTimeout(t);
  }, [query]);

  const queryKey = useMemo(
    () => ["search", debounced, contentRating, status, demographic, year] as const,
    [debounced, contentRating, status, demographic, year]
  );

  const q = useInfiniteQuery({
    queryKey,
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      searchManga({
        title: debounced || undefined,
        offset: pageParam,
        limit: 24,
        contentRating,
        status: status.length ? status : undefined,
        publicationDemographic: demographic.length ? demographic : undefined,
        year: year ? Number(year) : undefined,
        order: debounced ? { relevance: "desc" } : { followedCount: "desc" },
      }),
    getNextPageParam: (last) => {
      const next = last.offset + last.limit;
      return next < last.total ? next : undefined;
    },
  });

  useEffect(() => {
    const onScroll = () => {
      if (!q.hasNextPage || q.isFetchingNextPage) return;
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 800) {
        q.fetchNextPage();
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [q]);

  const results = q.data?.pages.flatMap((p) => p.data) ?? [];
  const toggle = (arr: string[], v: string, set: (v: string[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <div className="pointer-events-none absolute -left-4 select-none font-display text-[10rem] font-black text-primary/5 leading-none">
          検索
        </div>
        <h1 className="relative font-display text-5xl font-black tracking-wide sm:text-6xl">
          <span className="text-gradient">Search</span>
        </h1>
        <p className="mt-2 text-sm font-semibold text-muted-foreground uppercase tracking-widest">
          Discover manga across genres & demographics
        </p>
      </motion.div>

      {/* Search bar */}
      <div className="mt-8 flex items-center gap-3">
        <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/8 bg-card px-5 py-3.5 transition-all focus-within:border-primary/50 focus-within:shadow-[0_0_20px_rgba(255,45,85,0.1)]">
          <SearchIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search titles, authors, series…"
            className="flex-1 bg-transparent text-base font-semibold outline-none placeholder:text-muted-foreground/60"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-muted-foreground transition-colors hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters((s) => !s)}
          className={`flex h-[54px] items-center gap-2 rounded-2xl border px-5 text-sm font-bold transition-all ${
            showFilters
              ? "border-primary/50 bg-primary/10 text-primary"
              : "border-white/8 bg-card text-muted-foreground hover:text-white"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
        </button>
      </div>

      {/* Filter panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 rounded-2xl border border-white/8 bg-card p-5 space-y-5">
              <FilterGroup
                label="Content Rating"
                values={CONTENT_RATINGS}
                selected={contentRating}
                onToggle={(v) => toggle(contentRating, v, setContentRating)}
              />
              <FilterGroup
                label="Status"
                values={STATUSES}
                selected={status}
                onToggle={(v) => toggle(status, v, setStatus)}
              />
              <FilterGroup
                label="Demographic"
                values={DEMOS}
                selected={demographic}
                onToggle={(v) => toggle(demographic, v, setDemographic)}
              />
              <div>
                <div className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Year</div>
                <input
                  type="number"
                  placeholder="e.g. 2020"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-36 rounded-xl border border-white/8 bg-input px-4 py-2 text-sm font-semibold outline-none focus:border-primary/50"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results count */}
      {!q.isLoading && results.length > 0 && (
        <p className="mt-6 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {q.data?.pages[0].total.toLocaleString()} results
        </p>
      )}

      {/* Grid */}
      <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {results.map((m, i) => (
          <MangaCard key={m.id + i} manga={m} index={i} />
        ))}
        {q.isLoading && Array.from({ length: 12 }).map((_, i) => <MangaCardSkeleton key={i} />)}
      </div>

      {q.isFetchingNextPage && (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => <MangaCardSkeleton key={i} />)}
        </div>
      )}

      {!q.isLoading && results.length === 0 && (
        <div className="mt-24 text-center">
          <p className="font-display text-4xl font-black text-muted-foreground/30">無結果</p>
          <p className="mt-3 text-sm text-muted-foreground">No results found. Try a different search.</p>
        </div>
      )}
    </div>
  );
}

function FilterGroup({
  label,
  values,
  selected,
  onToggle,
}: {
  label: string;
  values: string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div>
      <div className="mb-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
      <div className="flex flex-wrap gap-2">
        {values.map((v) => {
          const active = selected.includes(v);
          return (
            <button
              key={v}
              onClick={() => onToggle(v)}
              className={`rounded-full px-4 py-1.5 text-xs font-black capitalize transition-all ${
                active
                  ? "bg-primary text-white shadow-md shadow-primary/30"
                  : "border border-white/8 bg-white/3 text-muted-foreground hover:border-primary/30 hover:text-white"
              }`}
            >
              {v}
            </button>
          );
        })}
      </div>
    </div>
  );
}
