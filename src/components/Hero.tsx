import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { Play, BookOpen, Star } from "lucide-react";
import { coverUrlFromManga, pickDescription, pickTitle, type Manga } from "@/lib/mangadex";
import { motion } from "framer-motion";

export function Hero({ manga }: { manga: Manga }) {
  const title = pickTitle(manga.attributes);
  const desc = pickDescription(manga.attributes);
  const cover = coverUrlFromManga(manga, "original");
  const tags = manga.attributes.tags.slice(0, 3).map((t) => t.attributes.name.en);
  

  return (
    <div className="relative h-[92vh] min-h-[600px] w-full overflow-hidden">
      {/* Background cover */}
      {cover && (
        <motion.img
          key={manga.id}
          initial={{ scale: 1.12, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          src={cover}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {/* Speed lines overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "repeating-linear-gradient(to right, transparent, transparent 40px, rgba(255,45,85,0.015) 40px, rgba(255,45,85,0.015) 41px)",
      }} />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#080810] via-[#080810]/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#080810] via-transparent to-[#080810]/40" />

      {/* Halftone dots corner decoration */}
      <div className="absolute right-0 top-0 h-96 w-96 opacity-30 pointer-events-none halftone" />

      {/* Manga panel frame lines */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-center px-6 pb-16 pt-24 sm:px-12 sm:pb-24">
        <div className="max-w-xl">
          {/* Featured badge */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-primary"
          >
            <Star className="h-3 w-3 fill-current" />
            Featured Series
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 font-display text-5xl font-black leading-none tracking-wide sm:text-7xl md:text-8xl"
          >
            <span className="text-gradient">{title}</span>
          </motion.h1>

          {/* Tags */}
          {tags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="mt-4 flex flex-wrap gap-2"
            >
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-accent/10 border border-accent/30 px-3 py-0.5 text-[11px] font-bold uppercase tracking-widest text-accent"
                >
                  {tag}
                </span>
              ))}
            </motion.div>
          )}

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mt-5 line-clamp-3 max-w-md text-sm leading-relaxed text-foreground/70 sm:text-base"
          >
            {desc}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link
              to="/manga/$id"
              params={{ id: manga.id }}
              className="group inline-flex items-center gap-2.5 rounded-full bg-primary px-7 py-3.5 text-sm font-black text-white shadow-lg shadow-primary/40 transition-all hover:scale-105 hover:shadow-primary/60"
            >
              <Play className="h-4 w-4 fill-current transition-transform group-hover:scale-110" />
              Start Reading
            </Link>
            <Link
              to="/manga/$id"
              params={{ id: manga.id }}
              className="inline-flex items-center gap-2.5 rounded-full glass neon-border px-7 py-3.5 text-sm font-black text-white transition-all hover:bg-white/10"
            >
              <BookOpen className="h-4 w-4" />
              Details
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Right side floating cover card */}
      {cover && (
        <motion.div
          initial={{ opacity: 0, x: 60, rotate: 3 }}
          animate={{ opacity: 1, x: 0, rotate: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="absolute right-8 top-1/2 hidden -translate-y-1/2 xl:block"
        >
          <div className="relative h-[480px] w-[320px] overflow-hidden rounded-2xl panel-border shadow-2xl shadow-black/60 animate-float">
            <img
  src={cover}
  referrerPolicy="no-referrer"
  crossOrigin="anonymous"
  alt={title}
/>
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black to-transparent" />
            {/* Neon corner accents */}
            <div className="absolute left-0 top-0 h-8 w-8 border-l-2 border-t-2 border-primary/80" />
            <div className="absolute right-0 top-0 h-8 w-8 border-r-2 border-t-2 border-primary/80" />
            <div className="absolute bottom-0 left-0 h-8 w-8 border-b-2 border-l-2 border-accent/60" />
            <div className="absolute bottom-0 right-0 h-8 w-8 border-b-2 border-r-2 border-accent/60" />
          </div>
        </motion.div>
      )}
    </div>
  );
}
