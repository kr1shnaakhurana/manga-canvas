import { createFileRoute } from "@tanstack/react-router";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Accept, Content-Type, Authorization, X-Requested-With",
  "Access-Control-Max-Age": "86400",
} as const;

const MANGADEX_API = "https://api.mangadex.org";

function jsonError(message: string, status: number) {
  return Response.json(
    { error: message },
    {
      status,
      headers: CORS_HEADERS,
    },
  );
}

export const Route = createFileRoute("/api/mangadex/$")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS_HEADERS }),
      GET: async ({ request, params }) => {
        try {
          const incomingUrl = new URL(request.url);
          const targetPath = params._splat ? `/${params._splat}` : "/";
          const targetUrl = new URL(`${MANGADEX_API}${targetPath}`);
          incomingUrl.searchParams.forEach((value, key) => {
            targetUrl.searchParams.append(key, value);
          });

          const upstream = await fetch(targetUrl.toString(), {
            headers: { Accept: "application/json" },
          });

          const headers = new Headers(CORS_HEADERS);
          headers.set("Content-Type", upstream.headers.get("content-type") ?? "application/json");
          headers.set("Cache-Control", "public, max-age=30, stale-while-revalidate=300");

          return new Response(upstream.body, {
            status: upstream.status,
            statusText: upstream.statusText,
            headers,
          });
        } catch (error) {
          return jsonError(error instanceof Error ? error.message : "MangaDex request failed", 502);
        }
      },
    },
  },
});