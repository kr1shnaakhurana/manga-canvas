import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { coverUrlFromManga, pickTitle, type Manga } from "@/lib/mangadex";

interface Props {
  manga: Manga;
  index?: number;
  size?: "sm" | "md" | "lg";
}

const STATUS_COLOR: Record<string, string> = {
  ongoing: "#00ff88",
  completed: "#00e5ff",
  hiatus: "#ffd700",
  cancelled: "#ff4444",
};

export function MangaCard({ manga, index = 0, size = "md" }: Props) {
  const title = pickTitle(manga.attributes);
  const cover = coverUrlFromManga(manga, 512);
  const status = manga.attributes.status;
  const dot = STATUS_COLOR[status] ?? "#aaa";

  const sizeCls =
    size === "sm"
      ? "w-[130px] sm:w-[150px]"
      : size === "lg"
        ? "w-[180px] sm:w-[210px]"
        : "w-[150px] sm:w-[185px]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: Math.min(index, 12) * 0.04, ease: [0.22, 1, 0.36, 1] }}
      className={`${sizeCls} shrink-0`}
    >
      <Link to="/manga/$id" params={{ id: manga.id }} className="group block">
        {/* Cover */}
        <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-muted shadow-[0_16px_40px_-8px_rgba(0,0,0,0.8)]">
          {cover ? (
            <img
              src={cover}
              alt={title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-card text-xs text-muted-foreground">
              No cover
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

          {/* Neon top-right corner accent */}
          <div className="absolute right-0 top-0 h-6 w-6 border-r-2 border-t-2 border-primary/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-accent/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Hover neon border */}
          <div className="absolute inset-0 rounded-xl border border-transparent transition-all duration-300 group-hover:border-primary/40 group-hover:shadow-[inset_0_0_20px_rgba(255,45,85,0.1)]" />

          {/* Status indicator */}
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full shadow-[0_0_6px_currentColor]"
              style={{ backgroundColor: dot, color: dot }}
            />
            <span className="text-[9px] font-black uppercase tracking-widest text-white/80">{status}</span>
          </div>
        </div>

        {/* Title */}
        <div className="mt-2.5 px-0.5">
          <h3 className="line-clamp-2 text-[13px] font-bold leading-snug text-foreground/90 transition-colors group-hover:text-primary">
            {title}
          </h3>
        </div>
      </Link>
    </motion.div>
  );
}

export function MangaCardSkeleton({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeCls =
    size === "sm" ? "w-[130px] sm:w-[150px]" : size === "lg" ? "w-[180px] sm:w-[210px]" : "w-[150px] sm:w-[185px]";
  return (
    <div className={`${sizeCls} shrink-0`}>
      <div className="aspect-[2/3] shimmer rounded-xl" />
      <div className="mt-2.5 h-3 shimmer rounded-full w-3/4" />
      <div className="mt-1.5 h-2.5 shimmer rounded-full w-1/2" />
    </div>
  );
}
