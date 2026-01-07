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
  extends Omit<RunnerOptions, "fontTypes" | "assetTypes" | "outputDir"> {
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
      outputDir,
      fontTypes: fontTypes as FontAssetType[],
      assetTypes: assetTypes as OtherAssetType[],
      ...options,
    },
    false
  );
};

const getRelativePath = (outputDir: string, file: string) => {
  if (file.endsWith(".css")) {
    return path.join("css", path.relative(outputDir, file));
  }
  return path.join("fonts", path.relative(outputDir, file));
};

export default defineWxtModule({
  name: "fantasticon",
  configKey: "fantasticon",
  setup(wxt, options?: FantasticonOptions) {
    if (!options) return;

    options.name ??= "icons";

    const outputDir = path.join(".icons", options.name);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    wxt.hook("build:publicAssets", async (_wxt, assets) => {
      console.log("Generating fantasticon assets...");
      try {
        const results = await generateFmgIconFont(outputDir, options);

        for (const { writePath } of results.writeResults) {
          if (writePath.endsWith(".ts")) continue;

          assets.push({
            relativeDest: getRelativePath(outputDir, writePath),
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
      console.log("Preparing fantasticon public paths...");
      try {
        const name = options?.name || "icons";

        paths.push(`css/${name}.css`);

        for (const type of options.fontTypes) {
          paths.push(`fonts/${name}.${type}`);
        }
      } catch (err) {
        // Ignore
      }
    });
  },
});
