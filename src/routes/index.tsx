import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  getLatestUpdates,
  getPopularManga,
  getRecentlyAdded,
  getTopRated,
  getRandomManga,
} from "@/lib/mangadex";
import { Hero } from "@/components/Hero";
import { Row } from "@/components/Row";
import { MangaCard, MangaCardSkeleton } from "@/components/MangaCard";
import { history } from "@/lib/library";
import { BookOpen, Flame, Clock, Star, Sparkles, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AniRead — Discover Manga" },
      { name: "description", content: "Discover the best manga. Popular, latest updates, and top rated series." },
    ],
  }),
  component: Home,
});

function Home() {
  const popular = useQuery({ queryKey: ["popular"], queryFn: () => getPopularManga(20) });
  const latest = useQuery({ queryKey: ["latest"], queryFn: () => getLatestUpdates(20) });
  const recent = useQuery({ queryKey: ["recent"], queryFn: () => getRecentlyAdded(20) });
  const rated = useQuery({ queryKey: ["rated"], queryFn: () => getTopRated(20) });
  const random = useQuery({
    queryKey: ["random-hero"],
    queryFn: getRandomManga,
    staleTime: 1000 * 60 * 5,
  });

  const [continueList, setContinueList] = useState(() =>
    typeof window !== "undefined" ? history.list().slice(0, 12) : []
  );

  useEffect(() => {
    const on = () => setContinueList(history.list().slice(0, 12));
    on();
    window.addEventListener("mv:storage", on);
    return () => window.removeEventListener("mv:storage", on);
  }, []);

  const heroManga = random.data?.data ?? popular.data?.data[0];

  return (
    <div className="-mt-16">
      {/* Hero */}
      {heroManga ? (
        <Hero manga={heroManga} />
      ) : (
        <div className="h-[92vh] min-h-[600px] shimmer" />
      )}

      <div className="relative mx-auto max-w-[1600px]">
        {/* Decorative kanji watermark */}
        <div className="pointer-events-none absolute -right-8 top-0 select-none font-display text-[20rem] font-black text-primary/[0.03] leading-none">
          漫
        </div>

        {/* Continue reading */}
        {continueList.length > 0 && (
          <section className="py-6">
            <div className="mb-5 flex items-end justify-between px-4 sm:px-8">
              <div className="flex items-start gap-3">
                <div className="mt-1.5 flex flex-col gap-1">
                  <span className="h-5 w-1.5 rounded-full bg-accent" />
                  <span className="h-2 w-1.5 rounded-full bg-accent/40" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-black tracking-wide sm:text-3xl">Continue Reading</h2>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Pick up where you left off</p>
                </div>
              </div>
            </div>
            <div className="flex gap-4 overflow-x-auto px-4 pb-4 sm:px-8 [scrollbar-width:thin]">
              {continueList.map((h, i) => (
                <motion.div
                  key={h.mangaId}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.04 }}
                >
                  <Link
                    to="/read/$chapterId"
                    params={{ chapterId: h.chapterId }}
                    className="group relative flex w-[260px] shrink-0 flex-col overflow-hidden rounded-xl bg-card panel-border transition-all hover:border-primary/40"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden">
                      {h.cover ? (
                        <img
                          src={h.cover}
                          alt={h.mangaTitle}
                          className="h-full w-full object-cover opacity-60 transition-all duration-500 group-hover:opacity-90 group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-full w-full bg-muted" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-primary text-white shadow-lg shadow-primary/50 transition-transform group-hover:scale-110">
                        <BookOpen className="h-3.5 w-3.5" />
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="line-clamp-1 text-sm font-bold">{h.mangaTitle}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{h.chapterLabel} · pg {h.page + 1}/{h.totalPages}</p>
                      <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full bg-primary shadow-sm shadow-primary/60"
                          style={{ width: `${Math.min(100, ((h.page + 1) / Math.max(1, h.totalPages)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Rows */}
        <Row title="Popular This Month" subtitle="Most followed right now">
          {popular.isLoading || !popular.data
            ? Array.from({ length: 8 }).map((_, i) => <MangaCardSkeleton key={i} />)
            : popular.data.data.map((m, i) => <MangaCard key={m.id} manga={m} index={i} />)}
        </Row>

        <Row title="Latest Updates" subtitle="Fresh chapters just dropped" accent>
          {latest.isLoading || !latest.data
            ? Array.from({ length: 8 }).map((_, i) => <MangaCardSkeleton key={i} />)
            : latest.data.data.map((m, i) => <MangaCard key={m.id} manga={m} index={i} />)}
        </Row>

        <Row title="Top Rated" subtitle="Highest community scores">
          {rated.isLoading || !rated.data
            ? Array.from({ length: 8 }).map((_, i) => <MangaCardSkeleton key={i} />)
            : rated.data.data.map((m, i) => <MangaCard key={m.id} manga={m} index={i} />)}
        </Row>

        <Row title="Recently Added" subtitle="Brand new to the library" accent>
          {recent.isLoading || !recent.data
            ? Array.from({ length: 8 }).map((_, i) => <MangaCardSkeleton key={i} />)
            : recent.data.data.map((m, i) => <MangaCard key={m.id} manga={m} index={i} />)}
        </Row>

        {/* Error state */}
        {popular.isError && (
          <div className="mx-4 mb-8 rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-center sm:mx-8">
            <p className="text-sm font-bold text-destructive">Failed to load manga.</p>
            <p className="mt-1 text-xs text-muted-foreground">{String(popular.error)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
