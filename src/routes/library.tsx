import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Bookmark, Clock, Play, Trash2 } from "lucide-react";
import { favorites, bookmarks, history, type LibraryEntry, type HistoryEntry } from "@/lib/library";

export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "Library — AniRead" },
      { name: "description", content: "Your favorites, bookmarks and reading history." },
    ],
  }),
  component: Library,
});

type Tab = "favorites" | "bookmarks" | "history";

function Library() {
  const [tab, setTab] = useState<Tab>("favorites");
  const [favs, setFavs] = useState<LibraryEntry[]>([]);
  const [books, setBooks] = useState<LibraryEntry[]>([]);
  const [hist, setHist] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const refresh = () => {
      setFavs(favorites.list());
      setBooks(bookmarks.list());
      setHist(history.list());
    };
    refresh();
    window.addEventListener("mv:storage", refresh);
    return () => window.removeEventListener("mv:storage", refresh);
  }, []);

  const tabs: { id: Tab; label: string; icon: typeof Heart; count: number }[] = [
    { id: "favorites", label: "Favorites", icon: Heart, count: favs.length },
    { id: "bookmarks", label: "Bookmarks", icon: Bookmark, count: books.length },
    { id: "history", label: "History", icon: Clock, count: hist.length },
  ];

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <div className="pointer-events-none absolute -left-4 select-none font-display text-[9rem] font-black text-primary/5 leading-none">
          本棚
        </div>
        <h1 className="relative font-display text-5xl font-black tracking-wide sm:text-6xl">
          <span className="text-gradient">Library</span>
        </h1>
        <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Your personal collection · saved on this device
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="mt-8 flex gap-1 rounded-2xl border border-white/8 bg-card p-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-black transition-all ${
                active ? "bg-primary text-white shadow-md shadow-primary/30" : "text-muted-foreground hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{t.label}</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${active ? "bg-white/20 text-white" : "bg-white/5 text-muted-foreground"}`}>
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="mt-8">
        {tab === "history" ? (
          <div className="space-y-3">
            {hist.length === 0 && <Empty label="No reading history yet." />}
            {hist.map((h, i) => (
              <motion.div
                key={h.mangaId + h.chapterId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.03 }}
                className="flex items-center gap-4 rounded-xl border border-white/6 bg-card p-3 transition-all hover:border-primary/20"
              >
                {h.cover ? (
                  <img src={h.cover} className="h-20 w-14 shrink-0 rounded-lg object-cover" alt={h.mangaTitle} />
                ) : (
                  <div className="h-20 w-14 shrink-0 rounded-lg bg-muted" />
                )}
                <div className="min-w-0 flex-1">
                  <Link
                    to="/manga/$id"
                    params={{ id: h.mangaId }}
                    className="line-clamp-1 text-sm font-bold transition-colors hover:text-primary"
                  >
                    {h.mangaTitle}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {h.chapterLabel} · pg {h.page + 1}/{h.totalPages}
                  </p>
                  <div className="mt-2 h-1 max-w-xs overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full bg-primary shadow-sm shadow-primary/50"
                      style={{ width: `${Math.min(100, ((h.page + 1) / Math.max(1, h.totalPages)) * 100)}%` }}
                    />
                  </div>
                </div>
                <Link
                  to="/read/$chapterId"
                  params={{ chapterId: h.chapterId }}
                  className="hidden shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-black text-white shadow-md shadow-primary/30 transition-all hover:scale-105 sm:flex"
                >
                  <Play className="h-3 w-3 fill-current" />
                  Continue
                </Link>
                <button
                  onClick={() => history.remove(h.mangaId)}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {(tab === "favorites" ? favs : books).map((e, i) => (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: i * 0.04 }}
              >
                <Link to="/manga/$id" params={{ id: e.id }} className="group block">
                  <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-muted ring-1 ring-white/5 transition-all group-hover:ring-primary/40">
                    {e.cover && (
                      <img
                        src={e.cover}
                        alt={e.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    )}
                    {/* Neon hover overlay */}
                    <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-t from-primary/20 to-transparent" />
                  </div>
                  <h3 className="mt-2.5 line-clamp-2 text-[13px] font-bold transition-colors group-hover:text-primary">
                    {e.title}
                  </h3>
                </Link>
              </motion.div>
            ))}
            {(tab === "favorites" ? favs : books).length === 0 && (
              <Empty label={`No ${tab} yet.`} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-24 text-center">
      <p className="font-display text-3xl font-black text-muted-foreground/20">空</p>
      <p className="mt-3 text-sm text-muted-foreground">{label}</p>
      <Link
        to="/search"
        className="mt-5 rounded-full bg-primary px-6 py-2.5 text-sm font-black text-white shadow-md shadow-primary/30"
      >
        Discover Manga
      </Link>
    </div>
  );
}
