import path from "node:path";
import fs from "node:fs";

import { addViteConfig, defineWxtModule } from "wxt/modules";

import setupServer from "./server";
import define from "./defines";

export default defineWxtModule({
  setup(wxt) {
    addViteConfig(wxt, () => ({ define }));

    const mapgenieDevPort = process.env.MAPGENIE_DEV_PORT ?? 3001;
    const mapgenieDevHost = process.env.MAPGENIE_DEV_HOST ?? "localhost";

    const mapgenieDevOrigin = `http://${mapgenieDevHost}:${mapgenieDevPort}`;

    const mapgenieApiUrl = mapgenieDevOrigin + "/api/v1";

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

    wxt.hook("server:created", (wxt) => {
      setupServer(wxt, Number(mapgenieDevPort), mapgenieDevHost);
    });

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
