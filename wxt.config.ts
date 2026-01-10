import { defineConfig, type UserManifest } from "wxt";

import { author, version, homepage } from "./package.json";

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifestVersion: 3,
  srcDir: "src",
  entrypointsDir: "contexts",
  modules: ["@wxt-dev/module-react"],
  imports: {
    imports: [
      {
        name: "logger",
        from: "@/common/logger",
      },
      { name: "default", as: "React", from: "react" },
      { name: "default", as: "$", from: "jquery" },
    ],
  },
  vite: () => ({
    build: {
      minify: "terser",
    },
  }),
  define: {
    "import.meta.env.PKG_VERSION": JSON.stringify(version),
    "import.meta.env.PKG_HOMEPAGE": JSON.stringify(homepage),
    "import.meta.env.PKG_AUTHOR": JSON.stringify(author),
  },
  fantasticon: {
    name: "fmg-icons",
    fontTypes: ["ttf", "woff", "woff2"],
    assetTypes: ["ts", "css"],
    pathOptions: {
      ts: "src/common/icons.ts",
    },
    fontsUrl: "/fonts",
    prefix: "fmg-icon",
    inputDir: "icons",
  },
  manifest: ({ browser, manifestVersion }) => {
    const manifest: UserManifest = {
      host_permissions: ["*://mapgenie.io/*", "*://cdn.mapgenie.io/*"],
      web_accessible_resources: [
        {
          matches: ["<all_urls>"],
          resources: ["page.js", "fonts/*", "css/*"],
        },
      ],
      permissions: [],
      background_page: "background/page.html",
    };

    if (manifestVersion === 2) {
      manifest.permissions!.push("webRequest", "webRequestBlocking");
    } else {
      manifest.permissions!.push("declarativeNetRequest");
    }

    if (browser === "chrome") {
      manifest.permissions!.push("offscreen");
    }

    if (browser === "firefox") {
      manifest.browser_specific_settings = {
        gecko: {
          id: "fmg@viper.net",
        },
      };
    }

    return manifest;
  },
});
