import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight, Maximize2, Minimize2, Settings2 } from "lucide-react";
import {
  getChapter,
  getChapterServer,
  getManga,
  getMangaChapters,
  coverUrlFromManga,
  pickTitle,
  findRel,
} from "@/lib/mangadex";
import { history } from "@/lib/library";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export const Route = createFileRoute("/read/$chapterId")({
  component: Reader,
});

type ReaderMode = "vertical" | "ltr" | "rtl";
type FitMode = "width" | "height";

function Reader() {
  const { chapterId } = Route.useParams();
  const navigate = useNavigate();

  const chapter = useQuery({ queryKey: ["chapter", chapterId], queryFn: () => getChapter(chapterId) });
  const server = useQuery({ queryKey: ["at-home", chapterId], queryFn: () => getChapterServer(chapterId) });

  const mangaId = useMemo(() => {
    if (!chapter.data) return null;
    return findRel(chapter.data.data, "manga")?.id ?? null;
  }, [chapter.data]);

  const manga = useQuery({
    queryKey: ["manga", mangaId],
    queryFn: () => getManga(mangaId!),
    enabled: !!mangaId,
  });
  const feed = useQuery({
    queryKey: ["manga-chapters", mangaId],
    queryFn: () => getMangaChapters(mangaId!, { limit: 200, order: { volume: "asc", chapter: "asc" } }),
    enabled: !!mangaId,
  });

  const [mode, setMode] = useLocalStorage<ReaderMode>("mv:reader:mode", "vertical");
  const [fit, setFit] = useLocalStorage<FitMode>("mv:reader:fit", "width");
  const [quality, setQuality] = useLocalStorage<"data" | "dataSaver">("mv:reader:quality", "data");
  const [page, setPage] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [showPanel, setShowPanel] = useState(false);

  const pages = useMemo(() => {
    if (!server.data) return [];
    const arr = quality === "data" ? server.data.chapter.data : server.data.chapter.dataSaver;
    return arr.map((f) => `${server.data!.baseUrl}/${quality}/${server.data!.chapter.hash}/${f}`);
  }, [server.data, quality]);

  const chapterIdx = useMemo(() => {
    if (!feed.data) return -1;
    return feed.data.data.findIndex((c) => c.id === chapterId);
  }, [feed.data, chapterId]);

  const prevChapter = chapterIdx > 0 ? feed.data?.data[chapterIdx - 1] : undefined;
  const nextChapter = chapterIdx >= 0 && feed.data ? feed.data.data[chapterIdx + 1] : undefined;

  const chapterLabel = useMemo(() => {
    if (!chapter.data) return "";
    const a = chapter.data.data.attributes;
    return `Ch. ${a.chapter ?? "?"}${a.title ? ` — ${a.title}` : ""}`;
  }, [chapter.data]);

  // History tracking
  useEffect(() => {
    if (!manga.data || !mangaId || pages.length === 0) return;
    history.update({
      mangaId,
      mangaTitle: pickTitle(manga.data.data.attributes),
      cover: coverUrlFromManga(manga.data.data, 512),
      chapterId,
      chapterLabel,
      page,
      totalPages: pages.length,
      updatedAt: Date.now(),
    });
  }, [manga.data, mangaId, chapterId, chapterLabel, page, pages.length]);

  // Auto-hide controls
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const kick = useCallback(() => {
    setControlsVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setControlsVisible(false), 3000);
  }, []);
  useEffect(() => {
    kick();
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
  }, [kick]);

  const goNext = useCallback(() => {
    if (page < pages.length - 1) setPage((p) => p + 1);
    else if (nextChapter) navigate({ to: "/read/$chapterId", params: { chapterId: nextChapter.id } });
  }, [page, pages.length, nextChapter, navigate]);

  const goPrev = useCallback(() => {
    if (page > 0) setPage((p) => p - 1);
    else if (prevChapter) navigate({ to: "/read/$chapterId", params: { chapterId: prevChapter.id } });
  }, [page, prevChapter, navigate]);

  // Keyboard nav
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") mode === "rtl" ? goPrev() : goNext();
      else if (e.key === "ArrowLeft") mode === "rtl" ? goNext() : goPrev();
      else if (e.key === "ArrowDown") goNext();
      else if (e.key === "ArrowUp") goPrev();
      else if (e.key === "f") toggleFullscreen();
      else if (e.key === "Escape") setShowPanel(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev, mode]);

  const [isFull, setIsFull] = useState(false);
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  };
  useEffect(() => {
    const on = () => setIsFull(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", on);
    return () => document.removeEventListener("fullscreenchange", on);
  }, []);

  // Preload pages
  useEffect(() => {
    for (let i = 1; i <= 3; i++) {
      if (pages[page + i]) {
        const img = new Image();
        img.src = pages[page + i];
      }
    }
  }, [page, pages]);

  // Vertical scroll tracking
  const verticalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (mode !== "vertical") return;
    const onScroll = () => {
      const el = verticalRef.current;
      if (!el) return;
      const children = Array.from(el.querySelectorAll("[data-page]"));
      const midY = window.innerHeight / 2;
      for (let i = 0; i < children.length; i++) {
        const rect = children[i].getBoundingClientRect();
        if (rect.top <= midY && rect.bottom >= midY) {
          setPage(i);
          break;
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [mode, pages.length]);

  if (server.isLoading || chapter.isLoading) {
    return (
      <div className="fixed inset-0 grid place-items-center bg-black">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-primary border-t-transparent shadow-[0_0_20px_rgba(255,45,85,0.5)]" />
          <p className="mt-5 text-sm font-bold uppercase tracking-widest text-muted-foreground">Loading chapter…</p>
        </div>
      </div>
    );
  }

  if (server.error) {
    return (
      <div className="p-16 text-center">
        <p className="font-display text-4xl font-black text-destructive">ERROR</p>
        <p className="mt-3 text-sm text-muted-foreground">Failed to load chapter pages.</p>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen bg-black"
      onMouseMove={kick}
      onClick={kick}
    >
      {/* Reading area */}
      {mode === "vertical" ? (
        <div ref={verticalRef} className="flex flex-col items-center py-4">
          {pages.map((src, i) => (
            <img
              key={src}
              data-page={i}
              src={src}
              alt={`page ${i + 1}`}
              loading={i < 3 ? "eager" : "lazy"}
              className={`max-w-full select-none ${fit === "width" ? "w-full max-w-4xl" : "max-h-screen w-auto"}`}
              draggable={false}
            />
          ))}
          {nextChapter && (
            <Link
              to="/read/$chapterId"
              params={{ chapterId: nextChapter.id }}
              className="my-16 rounded-full bg-primary px-10 py-3.5 text-sm font-black text-white shadow-lg shadow-primary/40"
            >
              Next Chapter →
            </Link>
          )}
        </div>
      ) : (
        <div className="flex min-h-screen items-center justify-center bg-black">
          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="fixed left-0 top-0 h-full w-1/3 cursor-w-resize"
            aria-label="Previous page"
          />
          {pages[page] && (
            <img
              src={pages[page]}
              alt={`page ${page + 1}`}
              className={`select-none ${fit === "width" ? "w-full h-auto max-w-5xl" : "h-screen w-auto"}`}
              draggable={false}
            />
          )}
          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="fixed right-0 top-0 h-full w-1/3 cursor-e-resize"
            aria-label="Next page"
          />
        </div>
      )}

      {/* Top bar */}
      <AnimatePresence>
        {controlsVisible && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-0 z-50"
          >
            <div className="m-3 flex items-center gap-3 rounded-2xl border border-white/8 bg-black/80 px-4 py-3 backdrop-blur-xl">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (mangaId) navigate({ to: "/manga/$id", params: { id: mangaId } });
                }}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 transition-colors hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">
                  {manga.data ? pickTitle(manga.data.data.attributes) : ""}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {chapterLabel} · Page {page + 1} / {pages.length}
                </p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setShowPanel((s) => !s); }}
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border transition-colors ${showPanel ? "border-primary/50 bg-primary/15 text-primary" : "border-white/10 bg-white/5 hover:bg-white/10"}`}
              >
                <Settings2 className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 transition-colors hover:bg-white/10"
              >
                {isFull ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom bar */}
      <AnimatePresence>
        {controlsVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 bottom-0 z-50"
          >
            <div className="mx-3 mb-3 flex items-center gap-3 rounded-2xl border border-white/8 bg-black/80 px-4 py-3 backdrop-blur-xl">
              <button
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                disabled={page === 0 && !prevChapter}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 transition-colors hover:bg-white/10 disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {/* Progress bar */}
              <div className="flex flex-1 flex-col gap-1.5">
                <input
                  type="range"
                  min={0}
                  max={Math.max(0, pages.length - 1)}
                  value={page}
                  onChange={(e) => setPage(Number(e.target.value))}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full cursor-pointer accent-primary"
                  style={{ accentColor: "#ff2d55" }}
                />
              </div>

              <span className="w-16 shrink-0 text-right text-xs font-bold tabular-nums text-muted-foreground">
                {page + 1} / {pages.length}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 transition-colors hover:bg-white/10"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings panel */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed right-3 top-20 z-50 w-72"
          >
            <div className="space-y-4 rounded-2xl border border-white/10 bg-black/90 p-4 backdrop-blur-xl">
              <PanelGroup label="Reading Mode">
                {(["vertical", "ltr", "rtl"] as ReaderMode[]).map((m) => (
                  <PanelChip key={m} active={mode === m} onClick={() => setMode(m)}>
                    {m === "vertical" ? "Vertical" : m === "ltr" ? "← Left to Right" : "Right to Left →"}
                  </PanelChip>
                ))}
              </PanelGroup>
              <PanelGroup label="Fit">
                {(["width", "height"] as FitMode[]).map((f) => (
                  <PanelChip key={f} active={fit === f} onClick={() => setFit(f)}>
                    Fit {f}
                  </PanelChip>
                ))}
              </PanelGroup>
              <PanelGroup label="Quality">
                <PanelChip active={quality === "data"} onClick={() => setQuality("data")}>High</PanelChip>
                <PanelChip active={quality === "dataSaver"} onClick={() => setQuality("dataSaver")}>Data Saver</PanelChip>
              </PanelGroup>
              <PanelGroup label="Chapters">
                <div className="max-h-56 w-full space-y-1 overflow-y-auto">
                  {feed.data?.data.map((c) => (
                    <Link
                      key={c.id}
                      to="/read/$chapterId"
                      params={{ chapterId: c.id }}
                      className={`block truncate rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                        c.id === chapterId
                          ? "bg-primary text-white shadow-sm shadow-primary/30"
                          : "text-muted-foreground hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      Ch. {c.attributes.chapter ?? "?"}{c.attributes.title ? ` — ${c.attributes.title}` : ""}
                    </Link>
                  ))}
                </div>
              </PanelGroup>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PanelGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function PanelChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
        active
          ? "bg-primary text-white shadow-sm shadow-primary/30"
          : "border border-white/10 bg-white/5 text-muted-foreground hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}
