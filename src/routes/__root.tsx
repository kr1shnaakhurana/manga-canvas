import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Navbar } from "@/components/Navbar";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="relative">
          <span className="absolute -inset-4 text-[180px] font-display font-black text-primary/5 select-none">404</span>
          <h1 className="relative font-display text-8xl font-black text-gradient">404</h1>
        </div>
        <p className="mt-2 text-sm font-bold uppercase tracking-[0.3em] text-primary">Chapter not found</p>
        <p className="mt-4 text-sm text-muted-foreground">This page got isekai'd to another dimension.</p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-bold text-white shadow-lg shadow-primary/40 transition-all hover:scale-105 hover:shadow-primary/60"
        >
          Return to base →
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-5xl font-black text-gradient">ERROR</h1>
        <p className="mt-4 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-8 rounded-full bg-primary px-8 py-3 text-sm font-bold text-white"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "AniRead — Anime Manga Reader" },
      { name: "description", content: "The ultimate anime-style manga reader. Powered by MangaDex. Read thousands of manga in stunning quality." },
      { name: "theme-color", content: "#080810" },
      { property: "og:title", content: "AniRead — Anime Manga Reader" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Bangers&family=Nunito:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body suppressHydrationWarning>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isReader = pathname.startsWith("/read/");

  return (
    <QueryClientProvider client={queryClient}>
      {!isReader && <Navbar />}
      <main className={isReader ? "" : "pt-16 pb-24 md:pb-8"}>
        <Outlet />
      </main>
    </QueryClientProvider>
  );
}
