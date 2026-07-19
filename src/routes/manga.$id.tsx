import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Bookmark, Play, Calendar, User, PenTool, Globe, Star, BookOpen, Clock } from "lucide-react";
import {
  getManga,
  getMangaChapters,
  coverUrlFromManga,
  pickTitle,
  pickDescription,
  findRel,
  relName,
} from "@/lib/mangadex";
import { favorites, bookmarks, history } from "@/lib/library";

export const Route = createFileRoute("/manga/$id")({
  component: MangaDetails,
});

function MangaDetails() {
  const { id } = Route.useParams();
  const manga = useQuery({ queryKey: ["manga", id], queryFn: () => getManga(id) });
  const chapters = useQuery({
    queryKey: ["manga-chapters", id],
    queryFn: () => getMangaChapters(id, { limit: 200 }),
    enabled: !!id,
  });

  const [isFav, setIsFav] = useState(false);
  const [isBook, setIsBook] = useState(false);

  useEffect(() => {
    setIsFav(favorites.has(id));
    setIsBook(bookmarks.has(id));
  }, [id]);

  if (manga.isLoading) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-8">
        <div className="h-96 shimmer rounded-2xl" />
      </div>
    );
  }

  if (!manga.data) return <div className="p-16 text-center text-muted-foreground">Manga not found.</div>;

  const m = manga.data.data;
  const title = pickTitle(m.attributes);
  const desc = pickDescription(m.attributes);
  const cover = coverUrlFromManga(m, "original");
  const author = relName(findRel(m, "author"));
  const artist = relName(findRel(m, "artist"));
  const hist = history.get(id);

  const chapterList = chapters.data?.data ?? [];
  const firstChapter = chapterList[chapterList.length - 1];
  const continueChapter = hist ? { id: hist.chapterId, label: hist.chapterLabel } : null;
  const entry = { id, title, cover, addedAt: Date.now() };

  return (
    <div className="-mt-16">
      {/* Full-bleed blurred header */}
      <div className="relative h-[55vh] min-h-[380px] w-full overflow-hidden">
        {cover && (
          <img
            src={cover}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover scale-110 blur-xl opacity-30"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#080810]/60 via-[#080810]/50 to-[#080810]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080810]/80 via-transparent to-transparent" />
        {/* Halftone */}
        <div className="absolute right-0 top-0 h-80 w-80 opacity-20 halftone pointer-events-none" />
      </div>

      <div className="relative z-10 mx-auto -mt-72 max-w-[1400px] px-4 sm:px-8">
        <div className="flex flex-col gap-8 md:flex-row">
          {/* Cover card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto w-[200px] shrink-0 sm:w-[240px] md:mx-0"
          >
            <div className="relative overflow-hidden rounded-xl shadow-2xl shadow-black/70 panel-border">
              {cover && <img src={cover} alt={title} className="w-full" />}
              {/* Neon corner brackets */}
              <div className="absolute left-0 top-0 h-8 w-8 border-l-2 border-t-2 border-primary" />
              <div className="absolute right-0 top-0 h-8 w-8 border-r-2 border-t-2 border-primary" />
              <div className="absolute bottom-0 left-0 h-8 w-8 border-b-2 border-l-2 border-accent/60" />
              <div className="absolute bottom-0 right-0 h-8 w-8 border-b-2 border-r-2 border-accent/60" />
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1"
          >
            {/* Status badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-primary">
                {m.attributes.status}
              </span>
              {m.attributes.year && (
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">
                  {m.attributes.year}
                </span>
              )}
              {m.attributes.publicationDemographic && (
                <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-accent">
                  {m.attributes.publicationDemographic}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="mt-4 font-display text-4xl font-black leading-none tracking-wide sm:text-5xl md:text-6xl">
              <span className="text-gradient">{title}</span>
            </h1>

            {/* Alt titles */}
            {m.attributes.altTitles.length > 0 && (
              <p className="mt-2 text-sm text-muted-foreground line-clamp-1">
                {m.attributes.altTitles.slice(0, 3).map((t) => Object.values(t)[0]).filter(Boolean).join(" · ")}
              </p>
            )}

            {/* Meta row */}
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <PenTool className="h-3.5 w-3.5 text-primary" />
                {author}
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <User className="h-3.5 w-3.5 text-primary" />
                {artist}
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Globe className="h-3.5 w-3.5 text-accent" />
                {m.attributes.originalLanguage.toUpperCase()}
              </span>
            </div>

            {/* Description */}
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-foreground/75 line-clamp-4">{desc}</p>

            {/* Tags */}
            <div className="mt-5 flex flex-wrap gap-2">
              {m.attributes.tags.slice(0, 12).map((t) => (
                <span
                  key={t.id}
                  className="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-[11px] font-semibold text-foreground/60 transition-colors hover:border-primary/30 hover:text-primary"
                >
                  {t.attributes.name.en}
                </span>
              ))}
            </div>

            {/* Action buttons */}
            <div className="mt-8 flex flex-wrap gap-3">
              {(continueChapter || firstChapter) && (
                <Link
                  to="/read/$chapterId"
                  params={{ chapterId: continueChapter?.id ?? firstChapter!.id }}
                  className="inline-flex items-center gap-2.5 rounded-full bg-primary px-7 py-3.5 text-sm font-black text-white shadow-lg shadow-primary/40 transition-all hover:scale-105 hover:shadow-primary/60"
                >
                  <Play className="h-4 w-4 fill-current" />
                  {continueChapter ? `Continue · ${continueChapter.label}` : "Start Reading"}
                </Link>
              )}
              <button
                onClick={() => setIsFav(favorites.toggle(entry))}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-3.5 text-sm font-black transition-all ${
                  isFav
                    ? "bg-primary/15 border border-primary/50 text-primary shadow-sm shadow-primary/20"
                    : "glass border border-white/10 text-muted-foreground hover:text-white"
                }`}
              >
                <Heart className={`h-4 w-4 ${isFav ? "fill-current" : ""}`} />
                {isFav ? "Favorited" : "Favorite"}
              </button>
              <button
                onClick={() => setIsBook(bookmarks.toggle(entry))}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-3.5 text-sm font-black transition-all ${
                  isBook
                    ? "bg-accent/15 border border-accent/50 text-accent"
                    : "glass border border-white/10 text-muted-foreground hover:text-white"
                }`}
              >
                <Bookmark className={`h-4 w-4 ${isBook ? "fill-current" : ""}`} />
                {isBook ? "Bookmarked" : "Bookmark"}
              </button>
            </div>
          </motion.div>
        </div>

        {/* Chapters section */}
        <section className="mt-16 pb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-1">
                <span className="h-5 w-1.5 rounded-full bg-primary" />
                <span className="h-2 w-1.5 rounded-full bg-primary/40" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-black tracking-wide sm:text-3xl">Chapters</h2>
                <p className="mt-0.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {chapters.data?.total ?? 0} total
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            {chapters.isLoading &&
              Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-14 shimmer rounded-xl" />
              ))}

            {chapterList.map((c, i) => {
              const label = `Ch. ${c.attributes.chapter ?? "?"}${c.attributes.title ? ` — ${c.attributes.title}` : ""}`;
              const group = relName(c.relationships.find((r) => r.type === "scanlation_group"));
              const isHistory = hist?.chapterId === c.id;

              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: Math.min(i, 20) * 0.015 }}
                >
                  <Link
                    to="/read/$chapterId"
                    params={{ chapterId: c.id }}
                    className={`group flex items-center justify-between rounded-xl px-4 py-3 transition-all ${
                      isHistory
                        ? "bg-primary/10 border border-primary/30"
                        : "bg-card/60 border border-white/5 hover:bg-card hover:border-primary/25"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{label}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {c.attributes.translatedLanguage?.toUpperCase()} · {group} · {c.attributes.pages} pages
                      </p>
                    </div>
                    <div className="ml-4 flex items-center gap-3">
                      {isHistory && (
                        <span className="text-[10px] font-black uppercase tracking-wider text-primary">Reading</span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {c.attributes.publishAt ? new Date(c.attributes.publishAt).toLocaleDateString() : ""}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}

            {chapters.data && chapterList.length === 0 && (
              <div className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
                No English chapters available yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
