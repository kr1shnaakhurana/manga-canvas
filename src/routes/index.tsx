import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
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
import { Link } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mangaverse — Discover manga" },
      { name: "description", content: "Discover popular, latest, and trending manga. A premium reading experience powered by MangaDex." },
    ],
  }),
  component: Home,
});

function Home() {
  const popular = useQuery({ queryKey: ["popular"], queryFn: () => getPopularManga(20) });
  const latest = useQuery({ queryKey: ["latest"], queryFn: () => getLatestUpdates(20) });
  const recent = useQuery({ queryKey: ["recent"], queryFn: () => getRecentlyAdded(20) });
  const rated = useQuery({ queryKey: ["rated"], queryFn: () => getTopRated(20) });
  const random = useQuery({ queryKey: ["random-hero"], queryFn: getRandomManga, staleTime: 1000 * 60 * 5 });

  const [continueList, setContinueList] = useState(() => (typeof window !== "undefined" ? history.list().slice(0, 12) : []));
  useEffect(() => {
    const on = () => setContinueList(history.list().slice(0, 12));
    on();
    window.addEventListener("mv:storage", on);
    return () => window.removeEventListener("mv:storage", on);
  }, []);

  const heroManga = random.data?.data ?? popular.data?.data[0];

  return (
    <div className="-mt-16">
      {heroManga ? (
        <Hero manga={heroManga} />
      ) : (
        <div className="h-[80vh] min-h-[560px] shimmer" />
      )}

      <div className="mx-auto max-w-[1600px]">
        {continueList.length > 0 && (
          <section className="py-4">
            <div className="mb-4 flex items-end justify-between px-4 sm:px-8">
              <div>
                <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">Continue reading</h2>
                <p className="mt-1 text-sm text-muted-foreground">Pick up where you left off</p>
              </div>
            </div>
            <div className="flex gap-4 overflow-x-auto px-4 pb-4 sm:px-8">
              {continueList.map((h, i) => (
                <Link
                  key={h.mangaId}
                  to="/read/$chapterId"
                  params={{ chapterId: h.chapterId }}
                  className="group relative w-[280px] shrink-0 overflow-hidden rounded-2xl bg-card ring-1 ring-white/5 transition-all hover:ring-primary/40"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <div className="relative aspect-[16/10]">
                    {h.cover ? (
                      <img src={h.cover} alt={h.mangaTitle} className="h-full w-full object-cover opacity-70 blur-[1px] transition-all group-hover:opacity-90 group-hover:blur-0" />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                    <div className="absolute inset-x-3 bottom-3">
                      <p className="line-clamp-1 text-sm font-semibold">{h.mangaTitle}</p>
                      <p className="text-xs text-muted-foreground">{h.chapterLabel} · pg {h.page + 1}/{h.totalPages}</p>
                      <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full bg-primary" style={{ width: `${Math.min(100, ((h.page + 1) / Math.max(1, h.totalPages)) * 100)}%` }} />
                      </div>
                    </div>
                    <div className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-primary text-white shadow-lg shadow-primary/40 transition-transform group-hover:scale-110">
                      <BookOpen className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <Row title="Popular this month" subtitle="Most followed manga right now">
          {popular.data
            ? popular.data.data.map((m, i) => <MangaCard key={m.id} manga={m} index={i} />)
            : Array.from({ length: 8 }).map((_, i) => <MangaCardSkeleton key={i} />)}
        </Row>

        <Row title="Latest updates" subtitle="Fresh chapters just dropped">
          {latest.data
            ? latest.data.data.map((m, i) => <MangaCard key={m.id} manga={m} index={i} />)
            : Array.from({ length: 8 }).map((_, i) => <MangaCardSkeleton key={i} />)}
        </Row>

        <Row title="Top rated" subtitle="The community's highest scored series">
          {rated.data
            ? rated.data.data.map((m, i) => <MangaCard key={m.id} manga={m} index={i} />)
            : Array.from({ length: 8 }).map((_, i) => <MangaCardSkeleton key={i} />)}
        </Row>

        <Row title="Recently added" subtitle="New arrivals in the library">
          {recent.data
            ? recent.data.data.map((m, i) => <MangaCard key={m.id} manga={m} index={i} />)
            : Array.from({ length: 8 }).map((_, i) => <MangaCardSkeleton key={i} />)}
        </Row>
      </div>
    </div>
  );
}
