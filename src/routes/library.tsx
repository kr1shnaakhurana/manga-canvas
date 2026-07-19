import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Bookmark, Clock, Play, Trash2 } from "lucide-react";
import { favorites, bookmarks, history, type LibraryEntry, type HistoryEntry } from "@/lib/library";

export const Route = createFileRoute("/library")({
  head: () => ({ meta: [{ title: "Library — Mangaverse" }, { name: "description", content: "Your favorites, bookmarks, and reading history." }] }),
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
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Library</h1>
        <p className="mt-2 text-muted-foreground">Everything you've saved lives here — synced to this device.</p>
      </motion.div>

      <div className="mt-8 flex gap-2 border-b border-border">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
              <span className="rounded-full bg-white/5 px-2 text-xs">{t.count}</span>
              {active && <motion.span layoutId="lib-tab" className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" />}
            </button>
          );
        })}
      </div>

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
                className="glass flex items-center gap-4 rounded-2xl p-3"
              >
                {h.cover ? <img src={h.cover} className="h-20 w-14 rounded-lg object-cover" /> : <div className="h-20 w-14 rounded-lg bg-muted" />}
                <div className="min-w-0 flex-1">
                  <Link to="/manga/$id" params={{ id: h.mangaId }} className="line-clamp-1 font-medium hover:text-primary">{h.mangaTitle}</Link>
                  <p className="text-xs text-muted-foreground">{h.chapterLabel} · pg {h.page + 1}/{h.totalPages}</p>
                  <div className="mt-2 h-1 max-w-xs overflow-hidden rounded-full bg-white/10">
                    <div className="h-full bg-primary" style={{ width: `${Math.min(100, ((h.page + 1) / Math.max(1, h.totalPages)) * 100)}%` }} />
                  </div>
                </div>
                <Link
                  to="/read/$chapterId"
                  params={{ chapterId: h.chapterId }}
                  className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
                >
                  <Play className="h-3 w-3 fill-current" /> Continue
                </Link>
                <button onClick={() => history.remove(h.mangaId)} className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-white/5 hover:text-destructive">
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
                transition={{ duration: 0.5, delay: i * 0.03 }}
              >
                <Link to="/manga/$id" params={{ id: e.id }} className="group block">
                  <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-muted ring-1 ring-white/5 transition-all group-hover:ring-primary/40">
                    {e.cover ? (
                      <img src={e.cover} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : null}
                  </div>
                  <h3 className="mt-2 line-clamp-2 text-sm font-medium">{e.title}</h3>
                </Link>
              </motion.div>
            ))}
            {(tab === "favorites" ? favs : books).length === 0 && <Empty label={`No ${tab} yet.`} />}
          </div>
        )}
      </div>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="col-span-full grid place-items-center rounded-2xl border border-dashed border-border py-24 text-center text-muted-foreground">
      <p>{label}</p>
      <Link to="/search" className="mt-4 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground">Discover manga</Link>
    </div>
  );
}
