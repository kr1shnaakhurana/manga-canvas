import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface Props {
  title: string;
  subtitle?: string;
  to?: string;
  search?: Record<string, string>;
  children: ReactNode;
}

export function Row({ title, subtitle, to, children }: Props) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="py-4"
    >
      <div className="mb-4 flex items-end justify-between px-4 sm:px-8">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
          {subtitle ? (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        {to ? (
          <Link
            to={to}
            className="group flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            See all
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        ) : null}
      </div>
      <div className="flex gap-4 overflow-x-auto px-4 pb-4 sm:px-8 [scrollbar-width:thin]">
        {children}
      </div>
    </motion.section>
  );
}
