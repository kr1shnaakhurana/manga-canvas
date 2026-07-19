import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { coverUrlFromManga, pickTitle, type Manga } from "@/lib/mangadex";

interface Props {
  manga: Manga;
  index?: number;
  size?: "sm" | "md" | "lg";
}

export function MangaCard({ manga, index = 0, size = "md" }: Props) {
  const title = pickTitle(manga.attributes);
  const cover = coverUrlFromManga(manga, 512);
  const status = manga.attributes.status;

  const sizeCls =
    size === "sm"
      ? "w-[130px] sm:w-[150px]"
      : size === "lg"
        ? "w-[180px] sm:w-[210px]"
        : "w-[150px] sm:w-[180px]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: Math.min(index, 12) * 0.03, ease: [0.22, 1, 0.36, 1] }}
      className={`${sizeCls} shrink-0`}
    >
      <Link
        to="/manga/$id"
        params={{ id: manga.id }}
        className="group block"
      >
        <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-muted shadow-[0_20px_60px_-20px_oklch(0_0_0/0.7)] ring-1 ring-white/5 transition-all duration-500 group-hover:ring-primary/40 group-hover:shadow-[0_30px_80px_-20px_oklch(0.65_0.24_15/0.35)]">
          {cover ? (
            <img
              src={cover}
              alt={title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted text-xs text-muted-foreground">
              No cover
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/60 to-transparent opacity-80" />
          <div className="absolute inset-x-0 bottom-0 p-3">
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${
                  status === "ongoing"
                    ? "bg-emerald-400"
                    : status === "completed"
                      ? "bg-sky-400"
                      : "bg-amber-400"
                }`}
              />
              <span className="text-[10px] uppercase tracking-wider text-white/70">{status}</span>
            </div>
          </div>
        </div>
        <div className="mt-2.5 px-0.5">
          <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground/95 transition-colors group-hover:text-primary">
            {title}
          </h3>
        </div>
      </Link>
    </motion.div>
  );
}

export function MangaCardSkeleton({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeCls =
    size === "sm" ? "w-[130px] sm:w-[150px]" : size === "lg" ? "w-[180px] sm:w-[210px]" : "w-[150px] sm:w-[180px]";
  return (
    <div className={`${sizeCls} shrink-0`}>
      <div className="aspect-[2/3] shimmer rounded-2xl" />
      <div className="mt-2.5 h-3 shimmer rounded w-3/4" />
    </div>
  );
}
