import { generateFonts, type RunnerOptions } from "fantasticon";
import { validate } from "schema-utils";
import type webpack from "webpack";
import path from "node:path";
import fs from "node:fs";

const _pathJoin = path.join;
path.join = (...paths: string[]) => {
    if (paths[1]?.startsWith("**/*.")) {
        return _pathJoin(...paths).replace(/\\/g, "/");
    }
    return _pathJoin(...paths);
};

export interface FantasticonPluginOptions {
    config: RunnerOptions;
    onComplete?: (fontConfig: RunnerOptions) => any | null;
}

const schema: Parameters<typeof validate>[0] = {
    type: "object",
    required: ["config"],
    properties: {
        config: {
            type: "object",
        },
        onComplete: {
            instanceof: "Function",
        },
    },
};

export default class FantasticonPlugin {
    private pluginName: string;
    private options: FantasticonPluginOptions;

    constructor(options: FantasticonPluginOptions) {
        this.pluginName = "Fantasticon Plugin";
        this.options = options;
        validate(schema, options, {
            name: this.pluginName,
            baseDataPath: "options",
        });
    }

    apply(compiler: webpack.Compiler) {
        const { config } = this.options;

        config.pathOptions = Object.fromEntries(
            Object.entries(config.pathOptions ?? {}).map(([ext, path]) => [ext, this.fixPath(compiler, path)])
        );

        config.outputDir = this.fixPath(compiler, config.outputDir);

        const inputDir = path.resolve(config.inputDir);

        compiler.hooks.compilation.tap(this.pluginName, (compilation) => {
            compilation.contextDependencies.add(inputDir);
        });

        // compiler.hooks.beforeRun.tapAsync(this.pluginName, async (_compiler, callback) =>
        //     this.generateFont(config, callback)
        // );

        compiler.hooks.watchRun.tapAsync(this.pluginName, async (compiler, callback) =>
            !compiler.modifiedFiles || compiler.modifiedFiles.has(inputDir)
                ? this.generateFont(config, callback)
                : callback()
        );
    }

    private fixPath(compiler: webpack.Compiler, path: string) {
        return path.replace("[dist]", compiler.options.output.path ?? "./dist");
    }

    private async generateFont(fontConfig: RunnerOptions, callback: (err?: any) => void) {
        const { onComplete = null } = this.options;

        try {
            console.log("> Compiling icon font!");

            if (!fs.existsSync(fontConfig.outputDir)) {
                fs.mkdirSync(fontConfig.outputDir, { recursive: true });
            }

            await generateFonts(fontConfig);

            if (onComplete) onComplete(fontConfig);
            console.log("> Icon font compiled!");
            callback();
        } catch (err) {
            callback(err);
        }
    }
}
