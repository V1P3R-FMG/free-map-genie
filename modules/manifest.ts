import { defineWxtModule } from "wxt/modules";

export default defineWxtModule({
  setup(wxt) {
    wxt.hook("build:manifestGenerated", (wxt, manifest) => {
      if ("background_page" in manifest) {
        if (
          wxt.config.browser === "firefox" ||
          wxt.config.manifestVersion === 2
        ) {
          manifest.background = {
            page: manifest.background_page,
          };
        }
      }

      delete manifest.background_page;
    });
  },
});
