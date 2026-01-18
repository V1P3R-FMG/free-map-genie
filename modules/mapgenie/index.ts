/// <reference types="../../src/types/mapgenie/api.d.ts" />

import Cache from "file-system-cache";

import path from "node:path";
import fs from "node:fs";

import { addViteConfig, defineWxtModule } from "wxt/modules";

import setupServer from "./server";
import define from "./defines";

import type { Wxt } from "wxt";

const cache = Cache({
  basePath: ".cache",
  ns: "mapgenie",
  ttl: 60 * 5, // 5 minutes
});

const fetchDomains = async (wxt: Wxt) => {
  const cached: string[] | null = await cache.get("domains");
  if (cached) {
    wxt.logger.log("[MapGenie] Using cached domains");
    return cached;
  } else {
    wxt.logger.log("[MapGenie] Fetching domains from MapGenie API");
  }

  const res = await fetch("https://mapgenie.io/api/v1/games");
  const data = await res.json();
  const games = data as MG.Api.Game[];

  const domains = Array.from(
    new Set<string>(
      games.map((game) => new URL(game.config.url)).map((url) => url.host)
    )
  );

  await cache.set("domains", domains);

  return domains;
};

const replaceAllUrls = (arr: string[], domains: string[]) => {
  const idx = arr.findIndex((url) => url === "<mapgenie_domains>") ?? -1;
  if (idx === -1) return;
  arr.splice(idx, 1);
  arr.push(...domains.map((d) => `*://${d}/*`));
};

export default defineWxtModule({
  setup(wxt) {
    let domains: string[] | null = null;

    // Add custom defines
    addViteConfig(wxt, () => ({ define }));

    wxt.hook("entrypoints:resolved", async (wxt, entrypoints) => {
      domains ??= await fetchDomains(wxt);

      for (const ep of entrypoints) {
        if ("matches" in ep.options) {
          replaceAllUrls(ep.options.matches, domains!);
        }
      }
    });

    wxt.hook("build:manifestGenerated", async (wxt, manifest) => {
      domains ??= await fetchDomains(wxt);

      for (const resource of manifest.web_accessible_resources) {
        if (typeof resource === "string") continue;
        replaceAllUrls(resource.matches, domains!);
      }
    });

    const mapgenieDevPort = process.env.MAPGENIE_DEV_PORT ?? 3001;
    const mapgenieDevHost = process.env.MAPGENIE_DEV_HOST ?? "localhost";

    const mapgenieDevOrigin = `http://${mapgenieDevHost}:${mapgenieDevPort}`;

    const mapgenieApiUrl = mapgenieDevOrigin + "/api/v1";

    // Define MAPGENIE_API_URL based on environment
    addViteConfig(wxt, (env) => {
      return {
        define: {
          "import.meta.env.MAPGENIE_API_URL":
            env.mode === "development"
              ? JSON.stringify(mapgenieApiUrl)
              : JSON.stringify("https://www.mapgenie.io/api/v1"),
        },
      };
    });

    // Setup dev server proxy for MapGenie
    wxt.hook("server:created", (wxt) => {
      setupServer(wxt, Number(mapgenieDevPort), mapgenieDevHost);
    });

    // Add MapGenie types
    wxt.hook("prepare:types", (wxt, types) => {
      types.push({
        path: "mapgenie.d.ts",
        text: fs.readFileSync(
          path.resolve(__dirname, "mapgenie.d.ts"),
          "utf-8"
        ),
        tsReference: true,
      });
    });
  },
});
