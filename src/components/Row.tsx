import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface Props {
  title: string;
  subtitle?: string;
  to?: string;
  accent?: boolean;
  children: ReactNode;
}

export function Row({ title, subtitle, to, accent = false, children }: Props) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="py-6"
    >
      <div className="mb-5 flex items-end justify-between px-4 sm:px-8">
        <div className="flex items-start gap-3">
          {/* Vertical accent bar — manga chapter number style */}
          <div className="mt-1.5 flex flex-col gap-1">
            <span className={`h-5 w-1.5 rounded-full ${accent ? "bg-accent" : "bg-primary"}`} />
            <span className={`h-2 w-1.5 rounded-full ${accent ? "bg-accent/40" : "bg-primary/40"}`} />
          </div>
          <div>
            <h2 className="font-display text-2xl font-black tracking-wide sm:text-3xl">{title}</h2>
            {subtitle && (
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
        {to && (
          <Link
            to={to}
            className="group flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
          >
            See all
            <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>

      <div className="flex gap-4 overflow-x-auto px-4 pb-4 sm:px-8 [scrollbar-width:thin] [scrollbar-color:rgba(255,45,85,0.3)_transparent]">
        {children}
      </div>
    </motion.section>
  );
}
