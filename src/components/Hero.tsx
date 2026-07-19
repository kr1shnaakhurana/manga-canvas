import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import { Link } from "@tanstack/react-router";
import { Play, Info } from "lucide-react";
import { coverUrlFromManga, pickDescription, pickTitle, type Manga } from "@/lib/mangadex";

export function Hero({ manga }: { manga: Manga }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const title = pickTitle(manga.attributes);
  const desc = pickDescription(manga.attributes);
  const cover = coverUrlFromManga(manga, "original");

  useEffect(() => {
    if (!rootRef.current) return;
    animate(rootRef.current.querySelectorAll("[data-hero-item]"), {
      opacity: [0, 1],
      translateY: [40, 0],
      duration: 900,
      delay: stagger(120, { start: 200 }),
      ease: "outExpo",
    });
    animate(rootRef.current.querySelectorAll("[data-hero-bg]"), {
      opacity: [0, 1],
      scale: [1.12, 1],
      duration: 1600,
      ease: "outExpo",
    });
  }, [manga.id]);

  return (
    <div ref={rootRef} className="relative h-[80vh] min-h-[560px] w-full overflow-hidden">
      {cover ? (
        <img
          data-hero-bg
          src={cover}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-0"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />

      <div className="relative z-10 flex h-full flex-col justify-end px-4 pb-24 sm:px-8 sm:pb-32">
        <div className="max-w-2xl">
          <div data-hero-item className="opacity-0">
            <span className="glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium uppercase tracking-widest text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px] shadow-primary" />
              Featured
            </span>
          </div>
          <h1
            data-hero-item
            className="font-display mt-4 text-4xl font-bold leading-[1.05] tracking-tight opacity-0 sm:text-6xl md:text-7xl"
          >
            <span className="text-gradient">{title}</span>
          </h1>
          <p
            data-hero-item
            className="mt-5 max-w-xl text-base leading-relaxed text-foreground/70 opacity-0 sm:text-lg line-clamp-3"
          >
            {desc}
          </p>
          <div data-hero-item className="mt-8 flex flex-wrap gap-3 opacity-0">
            <Link
              to="/manga/$id"
              params={{ id: manga.id }}
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:scale-[1.03] hover:shadow-primary/50"
            >
              <Play className="h-4 w-4 fill-current" />
              Start reading
            </Link>
            <Link
              to="/manga/$id"
              params={{ id: manga.id }}
              className="glass inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all hover:bg-white/10"
            >
              <Info className="h-4 w-4" />
              Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
