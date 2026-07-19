import { Link, useRouterState } from "@tanstack/react-router";
import { Search, Home, Library, Settings, Zap } from "lucide-react";
import { useEffect, useState } from "react";

const links = [
  { to: "/", label: "Home", icon: Home },
  { to: "/search", label: "Search", icon: Search },
  { to: "/library", label: "Library", icon: Library },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "glass-strong border-b border-primary/10"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 sm:px-8">
          {/* Logo */}
          <Link to="/" className="group flex items-center gap-2.5">
            <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-primary shadow-lg shadow-primary/50 transition-all group-hover:shadow-primary/80 group-hover:scale-110">
              <Zap className="h-5 w-5 fill-white text-white" />
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-accent animate-pulse-neon" />
            </div>
            <span className="font-display text-xl font-black tracking-wide">
              <span className="text-gradient">ANI</span>
              <span className="text-white">READ</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => {
              const active = l.to === "/" ? path === "/" : path.startsWith(l.to);
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`relative rounded-full px-5 py-2 text-sm font-bold tracking-wide transition-all ${
                    active
                      ? "text-white"
                      : "text-muted-foreground hover:text-white"
                  }`}
                >
                  {active && (
                    <span className="absolute inset-0 rounded-full bg-primary/15 neon-border" />
                  )}
                  <span className="relative">{l.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Search pill */}
          <Link
            to="/search"
            className="glass flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold text-muted-foreground transition-all hover:text-white hover:neon-border"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Search manga…</span>
          </Link>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="glass-strong fixed inset-x-3 bottom-3 z-50 flex items-center justify-around rounded-2xl py-2 md:hidden border border-primary/10">
        {links.map((l) => {
          const active = l.to === "/" ? path === "/" : path.startsWith(l.to);
          const Icon = l.icon;
          return (
            <Link
              key={l.to}
              to={l.to}
              className={`flex flex-col items-center gap-0.5 rounded-xl px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className={`h-5 w-5 transition-all ${active ? "drop-shadow-[0_0_6px_#ff2d55]" : ""}`} />
              {l.label}
              {active && <span className="h-0.5 w-4 rounded-full bg-primary" />}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
