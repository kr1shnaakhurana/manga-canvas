import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import type { Plugin } from "vite";

function mangadexProxyPlugin(): Plugin {
  return {
    name: "mangadex-proxy",
    configureServer(server) {
      server.middlewares.use("/api/mangadex", async (req, res) => {
        try {
          const requestUrl = new URL(
            req.originalUrl ?? req.url ?? "",
            "http://localhost"
          );

          // Remove /api/mangadex prefix
          const path = requestUrl.pathname.replace(/^\/api\/mangadex/, "");

          const target = new URL(
            `https://api.mangadex.org${path || "/"}`
          );

          // Copy all query params
          requestUrl.searchParams.forEach((value, key) => {
            target.searchParams.append(key, value);
          });

          //console.log("========== MangaDex ==========");
          //console.log("Incoming :", requestUrl.pathname + requestUrl.search);
          //console.log("Target   :", target.toString());

          const upstream = await fetch(target.toString(), {
            headers: {
              Accept: "application/json",
            },
          });

          const body = await upstream.text();

          //console.log("Status   :", upstream.status);
          //console.log("Body     :", body);

          res.statusCode = upstream.status;

          const ct =
            upstream.headers.get("content-type") ??
            "application/json";

          res.setHeader("Content-Type", ct);
          res.setHeader("Access-Control-Allow-Origin", "*");

          res.end(body);
        } catch (err) {
          console.error(err);

          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");

          res.end(
            JSON.stringify({
              error: err instanceof Error ? err.message : String(err),
            })
          );
        }
      });
    },
  };
}

export default defineConfig({
  tanstackStart: {
    server: {
      entry: "server",
    },
  },
  vite: {
   
  },
});
