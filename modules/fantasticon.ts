import { defineWxtModule } from "wxt/modules";
import {
  generateFonts,
  type RunnerOptions,
  type FontAssetType,
  type OtherAssetType,
} from "fantasticon";

import path from "node:path";
import fs from "node:fs";

interface FantasticonOptions
  extends Omit<
    RunnerOptions,
    "fontTypes" | "assetTypes" | "outputDir" | "fontsUrl" | "pathOptions"
  > {
  pathOptions?: {
    ts: string;
  };
  fontTypes?: Lowercase<keyof typeof FontAssetType>[];
  assetTypes?: Lowercase<keyof typeof OtherAssetType>[];
}

declare module "wxt" {
  interface InlineConfig {
    fantasticon?: FantasticonOptions;
  }
}

const generateFmgIconFont = async (
  outputDir: string,
  { fontTypes, assetTypes, ...options }: FantasticonOptions
) => {
  return generateFonts(
    {
      ...options,
      outputDir,
      pathOptions: {
        ts: options.pathOptions?.ts,
      },
      fontTypes: fontTypes as FontAssetType[],
      assetTypes: assetTypes as OtherAssetType[],
      fontsUrl: "/assets",
    },
    false
  );
};

export default defineWxtModule({
  name: "fantasticon",
  configKey: "fantasticon",
  setup(wxt, options?: FantasticonOptions) {
    if (!options) return;

    options.name ??= "icons";

    const outputDir = path.join(".icons", options.name, wxt.config.browser);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    wxt.hook("build:publicAssets", async (_wxt, assets) => {
      try {
        const results = await generateFmgIconFont(outputDir, {
          ...options,
        });

        for (const { writePath } of results.writeResults) {
          if (writePath.endsWith(".ts")) continue;

          assets.push({
            relativeDest: path.join(
              "assets",
              path.relative(outputDir, writePath)
            ),
            absoluteSrc: path.resolve(writePath),
          });
        }
      } catch (err) {
        wxt.logger.error(
          "Fantasticon generation failed:",
          String(err).replace(/^Error: /, "")
        );
      }
    });

    wxt.hook("prepare:publicPaths", async (_wxt, paths) => {
      const name = options?.name || "icons";

      if (options.assetTypes?.includes("ts")) {
        await generateFmgIconFont(outputDir, {
          ...options,
          assetTypes: ["ts"],
          fontTypes: [],
        });
      }

      paths.push(`css/${name}.css`);

      for (const type of options.fontTypes) {
        paths.push(`fonts/${name}.${type}`);
      }
    });
  },
});
