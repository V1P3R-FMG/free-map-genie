import path from "node:path";
import { defineWxtModule } from "wxt/modules";

export default defineWxtModule({
  setup(wxt) {
    const generateEntrypointName = (file: string) => {
      return file.replaceAll(/[\/\\]/g, "-").replace(/\.[^/.]+$/, "");
    };

    wxt.hook("build:manifestGenerated", (wxt, manifest) => {
      if (!manifest.background_page) return;

      const name = generateEntrypointName(manifest.background_page);

      const isFirefox = wxt.config.browser === "firefox";
      if (isFirefox) {
        manifest.background = {
          page: name + ".html",
        };
      }

      delete manifest.background_page;
    });

    wxt.hook("entrypoints:resolved", (wxt, entrypoints) => {
      if (!wxt.config.manifest.background_page) return;

      const isFirefox = wxt.config.browser === "firefox";
      if (!isFirefox) return;

      const name = generateEntrypointName(wxt.config.manifest.background_page);

      const entrypointsDir = path.resolve(
        wxt.config.srcDir,
        wxt.config.entrypointsDir
      );

      entrypoints.push({
        name,
        outputDir: wxt.config.outDir,
        inputPath: path.resolve(
          entrypointsDir,
          wxt.config.manifest.background_page
        ),
        type: "unlisted-page",
        options: {},
      });

      console.log("Resolved entrypoints:", entrypoints.length);
    });
  },
});
