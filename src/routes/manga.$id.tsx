import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Bookmark, Play, Calendar, User, PenTool, Globe, Star } from "lucide-react";
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

  if (manga.isLoading) return <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-8"><div className="h-96 shimmer rounded-3xl" /></div>;
  if (!manga.data) return <div className="p-16 text-center">Not found.</div>;

  const m = manga.data.data;
  const title = pickTitle(m.attributes);
  const desc = pickDescription(m.attributes);
  const cover = coverUrlFromManga(m, "original");
  const author = relName(findRel(m, "author"));
  const artist = relName(findRel(m, "artist"));
  const hist = history.get(id);

  const firstChapter = chapters.data?.data?.[chapters.data.data.length - 1];
  const continueChapter = hist ? { id: hist.chapterId, label: hist.chapterLabel } : null;

  const entry = { id, title, cover, addedAt: Date.now() };

  return (
    <div className="-mt-16">
      {/* Blurred cover header */}
      <div className="relative h-[60vh] min-h-[420px] w-full overflow-hidden">
        {cover && (
          <img src={cover} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover scale-110 blur-2xl opacity-40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
      </div>

      <div className="relative z-10 mx-auto -mt-64 max-w-[1400px] px-4 sm:px-8">
        <div className="flex flex-col gap-8 md:flex-row">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto w-[220px] shrink-0 sm:w-[260px] md:mx-0"
          >
            <div className="overflow-hidden rounded-2xl shadow-2xl shadow-black/60 ring-1 ring-white/10">
              {cover && <img src={cover} alt={title} className="w-full" />}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1"
          >
            <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <span className="rounded-full bg-white/5 px-2.5 py-1">{m.attributes.status}</span>
              {m.attributes.year && <span className="rounded-full bg-white/5 px-2.5 py-1">{m.attributes.year}</span>}
              {m.attributes.publicationDemographic && (
                <span className="rounded-full bg-white/5 px-2.5 py-1">{m.attributes.publicationDemographic}</span>
              )}
              <span className="rounded-full bg-white/5 px-2.5 py-1">{m.attributes.contentRating}</span>
            </div>

            <h1 className="font-display mt-3 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              <span className="text-gradient">{title}</span>
            </h1>

            {m.attributes.altTitles.length > 0 && (
              <p className="mt-2 text-sm text-muted-foreground line-clamp-1">
                {m.attributes.altTitles.slice(0, 3).map((t) => Object.values(t)[0]).filter(Boolean).join(" · ")}
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><PenTool className="h-3.5 w-3.5" />{author}</span>
              <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" />{artist}</span>
              <span className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" />{m.attributes.originalLanguage.toUpperCase()}</span>
              {m.attributes.year && (
                <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{m.attributes.year}</span>
              )}
            </div>

            <p className="mt-6 max-w-3xl whitespace-pre-line text-base leading-relaxed text-foreground/80">{desc}</p>

            <div className="mt-6 flex flex-wrap gap-2">
              {m.attributes.tags.slice(0, 12).map((t) => (
                <span key={t.id} className="rounded-full bg-white/5 px-3 py-1 text-xs text-foreground/70 ring-1 ring-white/5">
                  {t.attributes.name.en}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {(continueChapter || firstChapter) && (
                <Link
                  to="/read/$chapterId"
                  params={{ chapterId: continueChapter?.id ?? firstChapter!.id }}
                  className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-105"
                >
                  <Play className="h-4 w-4 fill-current" />
                  {continueChapter ? `Continue · ${continueChapter.label}` : "Start reading"}
                </Link>
              )}
              <button
                onClick={() => setIsFav(favorites.toggle(entry))}
                className={`glass inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all hover:bg-white/10 ${isFav ? "text-primary" : ""}`}
              >
                <Heart className={`h-4 w-4 ${isFav ? "fill-current" : ""}`} />
                Favorite
              </button>
              <button
                onClick={() => setIsBook(bookmarks.toggle(entry))}
                className={`glass inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all hover:bg-white/10 ${isBook ? "text-primary" : ""}`}
              >
                <Bookmark className={`h-4 w-4 ${isBook ? "fill-current" : ""}`} />
                Bookmark
              </button>
            </div>
          </motion.div>
        </div>

        {/* Chapters */}
        <section className="mt-16">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">Chapters</h2>
            <span className="text-sm text-muted-foreground">{chapters.data?.total ?? 0} total</span>
          </div>

          <div className="mt-6 grid gap-2">
            {chapters.isLoading &&
              Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-14 shimmer rounded-xl" />
              ))}
            {chapters.data?.data.map((c, i) => {
              const label = `Ch. ${c.attributes.chapter ?? "?"}${c.attributes.title ? ` — ${c.attributes.title}` : ""}`;
              const group = relName(c.relationships.find((r) => r.type === "scanlation_group"));
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: Math.min(i, 20) * 0.02 }}
                >
                  <Link
                    to="/read/$chapterId"
                    params={{ chapterId: c.id }}
                    className="group flex items-center justify-between rounded-xl bg-card/50 px-4 py-3 ring-1 ring-white/5 transition-all hover:bg-card hover:ring-primary/40"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{label}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {c.attributes.translatedLanguage?.toUpperCase()} · {group} · {c.attributes.pages} pages
                      </p>
                    </div>
                    <span className="ml-4 text-xs text-muted-foreground">
                      {c.attributes.publishAt ? new Date(c.attributes.publishAt).toLocaleDateString() : ""}
                    </span>
                  </Link>
                </motion.div>
              );
            })}
            {chapters.data && chapters.data.data.length === 0 && (
              <div className="rounded-xl bg-card/40 p-6 text-center text-sm text-muted-foreground">
                No English chapters available.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
