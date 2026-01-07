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
      { name: "default", as: "React", from: "react" },
      { name: "default", as: "$", from: "jquery" },
    ],
  },
  define: {
    "import.meta.env.PKG_VERSION": JSON.stringify(version),
    "import.meta.env.PKG_HOMEPAGE": JSON.stringify(homepage),
    "import.meta.env.PKG_AUTHOR": JSON.stringify(author),
  },
  webExt: {
    startUrls: ["https://mapgenie.io/"],
  },
  manifest: ({ browser, manifestVersion }) => {
    const manifest: UserManifest = {
      host_permissions: ["*://mapgenie.io/*"],
      permissions: [],
    };

    if (manifestVersion === 2) {
      manifest.permissions!.push("webRequest", "webRequestBlocking");
    } else {
      manifest.permissions!.push("declarativeNetRequest");
    }

    if (browser === "chrome") {
      manifest.permissions!.push("offscreen");
    }

    return manifest;
  },
});
