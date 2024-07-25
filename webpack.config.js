import path from "node:path";
import fs from "fs-extra";
import webpack from "webpack";
import "dotenv/config";

import { getBuildInfo } from "fmg-webpack-utils";
import WebExtManifestPlugin from "webpack-web-ext-manifest";

import WebExtPlugin from "web-ext-plugin";
import TsConfigPathsPlugin from "tsconfig-paths-webpack-plugin";
import CopyPlugin from "copy-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";

const { ProvidePlugin, DefinePlugin } = webpack;

const __dirname = import.meta.dirname;
// const __filename = import.meta.filename;

/** @type {import("webpack-cli").CallableOption} */
export default function (env) {
    const buildInfo = getBuildInfo(env, "build");

    if (fs.existsSync(buildInfo.out)) {
        fs.rmSync(buildInfo.out, { recursive: true });
    }

    return {
        entry: {
            extension: "./src/index.ts",
        },
        output: { path: buildInfo.out },
        resolveLoader: {
            modules: [
                path.resolve(__dirname, "webpack", "loaders"),
                "node_modules",
            ],
        },
        resolve: {
            extensions: [".ts", ".js", ".json"],
            plugins: [
                new TsConfigPathsPlugin({
                    configFile: "./tsconfig.json",
                }),
            ],
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    exclude: /(node_modules)/,
                    use: [
                        "fmg-import-globals-loader",
                        {
                            loader: "swc-loader",
                            options: {
                                sourceMaps: buildInfo.isDev,
                                inlineSourcesContent: buildInfo.isDev,
                                jsc: {
                                    parser: {
                                        syntax: "typescript",
                                    },
                                    target: "es2020",
                                },
                            },
                        },
                    ],
                },
            ],
        },
        plugins: [
            new CopyPlugin({
                patterns: [
                    { context: "src", from: "assets", to: "assets" },
                    ...(buildInfo.isDev & fs.existsSync("data/games.json")
                        ? [{ from: "data/games.json" }]
                        : []),
                ],
            }),
            new ProvidePlugin({
                $: "jquery",
                jQuery: "jquery",
                logger: [path.resolve("src", "logger.ts"), "default"],
            }),
            new DefinePlugin({
                __BROWSER__: JSON.stringify(buildInfo.browser),
                __VERSION__: JSON.stringify(buildInfo.version),
                __HOMEPAGE__: JSON.stringify(buildInfo.homepage),
                __AUTHOR__: JSON.stringify(buildInfo.author),
                __DEBUG__: buildInfo.isDev,
                __WATCH__: buildInfo.watch,
            }),
            new WebExtManifestPlugin({
                files: [
                    "./src/manifest.json",
                    `./src/manifest.${buildInfo.browser}.json`,
                    {
                        key: buildInfo.keys.public,
                        update_url: buildInfo.updateUrl,
                    },
                ],
                fields: ["version", "author", "name"],
                tabs: 2,
            }),
            new WebExtPlugin({
                artifactsDir: buildInfo.out,
                target: buildInfo.isChrome ? "chromium" : "firefox-desktop",
                buildPackage: !buildInfo.watch && !buildInfo.isDev,
                outputFilename: buildInfo.isDev
                    ? buildInfo.name
                    : buildInfo.name + (buildInfo.isChrome ? ".zip" : ".xpi"),
                runLint: false,
                selfHosted: true,
                overwriteDest: true,
                devtools: true,
                startUrl: process.env.START_URL,
                sourceDir: buildInfo.out,
                args: buildInfo.isChrome
                    ? [
                          "--auto-open-devtools-for-tabs",
                          "--system-developer-mode",
                      ]
                    : [],
            }),
        ],
        optimization: {
            minimize: !buildInfo.isDev,
            minimizer: [new TerserPlugin()],
        },
        watch: buildInfo.watch,
        devtool: buildInfo.isDev ? "inline-cheap-module-source-map" : false,
        watchOptions: {
            ignored: "node_modules",
            poll: 1000,
            aggregateTimeout: 300,
        },
        mode: buildInfo.mode,
    };
}
