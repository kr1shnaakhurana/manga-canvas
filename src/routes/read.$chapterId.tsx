import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight, Maximize2, Minimize2, List, Settings2 } from "lucide-react";
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
  const [zoom, setZoom] = useState(1);

  const pages = useMemo(() => {
    if (!server.data) return [];
    const arr = quality === "data" ? server.data.chapter.data : server.data.chapter.dataSaver;
    return arr.map((filename) => `${server.data!.baseUrl}/${quality}/${server.data!.chapter.hash}/${filename}`);
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

  // Persist history
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

  // Auto hide controls
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const kick = useCallback(() => {
    setControlsVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setControlsVisible(false), 2500);
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

  // Keyboard
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

  // Preload next 2 pages
  useEffect(() => {
    for (let i = 1; i <= 3; i++) {
      if (pages[page + i]) {
        const img = new Image();
        img.src = pages[page + i];
      }
    }
  }, [page, pages]);

  // Vertical scroll -> update current page
  const verticalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (mode !== "vertical") return;
    const el = verticalRef.current;
    if (!el) return;
    const onScroll = () => {
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
      <div className="fixed inset-0 grid place-items-center bg-background">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Loading chapter…</p>
        </div>
      </div>
    );
  }

  if (server.error) {
    return <div className="p-16 text-center">Failed to load chapter. Try another chapter.</div>;
  }

  const fitCls = fit === "width" ? "w-full h-auto" : "h-screen w-auto";

  return (
    <div className="relative min-h-screen bg-black" onMouseMove={kick} onClick={kick}>
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
              className={`max-w-full ${fit === "width" ? "w-full max-w-4xl" : "max-h-screen w-auto"} select-none`}
              draggable={false}
              onDoubleClick={() => setZoom((z) => (z === 1 ? 1.5 : 1))}
              style={{ transform: `scale(${zoom})`, transformOrigin: "center top" }}
            />
          ))}
          {nextChapter && (
            <Link
              to="/read/$chapterId"
              params={{ chapterId: nextChapter.id }}
              className="my-16 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30"
            >
              Next chapter →
            </Link>
          )}
        </div>
      ) : (
        <div className="flex min-h-screen items-center justify-center">
          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="fixed left-0 top-0 h-full w-1/3 cursor-w-resize"
            aria-label="Previous"
          />
          <img
            src={pages[page]}
            alt={`page ${page + 1}`}
            className={`${fitCls} select-none`}
            draggable={false}
            onDoubleClick={() => setZoom((z) => (z === 1 ? 1.5 : 1))}
            style={{ transform: `scale(${zoom})` }}
          />
          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="fixed right-0 top-0 h-full w-1/3 cursor-e-resize"
            aria-label="Next"
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
            className="fixed inset-x-0 top-0 z-50"
          >
            <div className="glass-strong m-3 flex items-center gap-3 rounded-2xl px-4 py-3">
              <button
                onClick={(e) => { e.stopPropagation(); mangaId && navigate({ to: "/manga/$id", params: { id: mangaId } }); }}
                className="grid h-9 w-9 place-items-center rounded-full bg-white/5 hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{manga.data ? pickTitle(manga.data.data.attributes) : ""}</p>
                <p className="truncate text-xs text-muted-foreground">{chapterLabel} · Page {page + 1} / {pages.length}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setShowPanel((s) => !s); }}
                className="grid h-9 w-9 place-items-center rounded-full bg-white/5 hover:bg-white/10"
              >
                <Settings2 className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                className="grid h-9 w-9 place-items-center rounded-full bg-white/5 hover:bg-white/10"
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
            className="fixed inset-x-0 bottom-0 z-50"
          >
            <div className="glass-strong mx-3 mb-3 flex items-center gap-3 rounded-2xl px-4 py-3">
              <button
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                className="grid h-9 w-9 place-items-center rounded-full bg-white/5 hover:bg-white/10"
                disabled={page === 0 && !prevChapter}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <input
                type="range"
                min={0}
                max={Math.max(0, pages.length - 1)}
                value={page}
                onChange={(e) => setPage(Number(e.target.value))}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 accent-primary"
              />
              <span className="w-16 text-right text-xs tabular-nums text-muted-foreground">{page + 1} / {pages.length}</span>
              <button
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                className="grid h-9 w-9 place-items-center rounded-full bg-white/5 hover:bg-white/10"
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
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            className="fixed right-3 top-20 z-50 w-72"
          >
            <div className="glass-strong space-y-4 rounded-2xl p-4">
              <PanelGroup label="Reading direction">
                {(["vertical", "ltr", "rtl"] as ReaderMode[]).map((m) => (
                  <PanelChip key={m} active={mode === m} onClick={() => setMode(m)}>
                    {m === "vertical" ? "Vertical" : m === "ltr" ? "Left → Right" : "Right → Left"}
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
              <PanelGroup label="Image quality">
                <PanelChip active={quality === "data"} onClick={() => setQuality("data")}>High</PanelChip>
                <PanelChip active={quality === "dataSaver"} onClick={() => setQuality("dataSaver")}>Data saver</PanelChip>
              </PanelGroup>
              <PanelGroup label="Chapters">
                <div className="max-h-56 space-y-1 overflow-y-auto">
                  {feed.data?.data.map((c) => (
                    <Link
                      key={c.id}
                      to="/read/$chapterId"
                      params={{ chapterId: c.id }}
                      className={`block truncate rounded-lg px-3 py-1.5 text-xs ${c.id === chapterId ? "bg-primary text-primary-foreground" : "hover:bg-white/5"}`}
                    >
                      Ch. {c.attributes.chapter ?? "?"} {c.attributes.title ? `— ${c.attributes.title}` : ""}
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
      <div className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}
function PanelChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${active ? "bg-primary text-primary-foreground" : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"}`}
    >
      {children}
    </button>
  );
}
