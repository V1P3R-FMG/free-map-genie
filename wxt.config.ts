import { defineConfig } from "wxt";
import "dotenv/config";

import { author, version, homepage } from "./package.json";

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifestVersion: 3,
  srcDir: "src",
  entrypointsDir: "contexts",
  modules: ["@wxt-dev/module-react"],
  imports: {
    imports: [
      { name: "logger", from: "@/common/logger" },
      { name: "default", as: "clsx", from: "clsx" },
      { name: "default", as: "React", from: "react" },
      { name: "default", as: "$", from: "jquery" },
    ],
  },
  vite: () => ({
    css: {
      modules: {
        localsConvention: "camelCase",
      },
    },
    esbuild: {
      target: "es2020",
    },
    build: {
      minify: "terser",
    },
  }),
  define: {
    "import.meta.env.PKG_VERSION": JSON.stringify(version),
    "import.meta.env.PKG_HOMEPAGE": JSON.stringify(homepage),
    "import.meta.env.PKG_AUTHOR": JSON.stringify(author),
    "import.meta.env.SERVICE_TIMEOUT": JSON.stringify(
      process.env.FMG_SERVICE_TIMEOUT ?? 60000
    ),
  },
  fantasticon: {
    name: "fmg-icons",
    fontTypes: ["ttf", "woff", "woff2"],
    assetTypes: ["ts", "css"],
    pathOptions: {
      ts: "src/common/icons.ts",
    },
    prefix: "fmg-icon",
    normalize: true,
    inputDir: "icons",
  },
  manifest: ({ browser, manifestVersion }) => ({
    host_permissions: ["*://mapgenie.io/*", "*://cdn.mapgenie.io/*"],
    web_accessible_resources: [
      {
        matches: ["<mapgenie_domains>"],
        resources: [
          "page.js",
          "popup.html",
          "logo.svg",
          "content-scripts/*.css",
          "assets/*",
        ],
      },
    ],
    permissions:
      browser === "chrome"
        ? ["declarativeNetRequest", "offscreen", "storage"]
        : manifestVersion === 2
          ? ["webRequest", "webRequestBlocking", "storage"]
          : ["declarativeNetRequest", "storage"],
    background_page: "background/page.html",
    browser_specific_settings:
      browser === "chrome"
        ? undefined
        : {
            gecko: {
              id: "fmg@viper.net",
            },
          },
  }),
});
