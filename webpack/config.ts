import path from "node:path";
import webpack from "webpack";
import { FontAssetType, ASSET_TYPES } from "fantasticon";
import "dotenv/config";

import getBuildInfo from "./buildInfo.js";
import WebExtManifestPlugin from "./plugins/web-ext-manifest.js";
import FantasticonPlugin from "./plugins/fantasticon.js";

import HtmlPlugin from "html-webpack-plugin";
import CopyPlugin from "copy-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import { TsconfigPathsPlugin } from "tsconfig-paths-webpack-plugin";
import { VueLoaderPlugin } from "vue-loader";

const { ProvidePlugin, DefinePlugin } = webpack;

const __dirname = import.meta.dirname;

export const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;
export const CACHE_MAX_AGE = process.env.PORT ? Number(process.env.PORT) : 30 * 60 * 1000;
export const MAX_BACKUPS_COUNT = process.env.MAX_BACKUPS_COUNT ? Number(process.env.MAX_BACKUPS_COUNT) : 10;

export default async function getConfig(): Promise<webpack.Configuration> {
    const buildInfo = getBuildInfo(path.resolve(__dirname, "..", "build"));
    const { default: WebExtPlugin } = await import("web-ext-plugin");

    return {
        entry: {
            "extension": "./src/contexts/extension/index.ts",
            "background": "./src/contexts/background/index.ts",
            "content": "./src/contexts/content/index.ts",
            "storage/main": "./src/contexts/storage/main.ts",
            "storage/offscreen": "./src/contexts/storage/offscreen.ts",
            "popup/index": "./src/popup/index.ts",
        },
        output: { path: buildInfo.out },
        resolve: {
            extensions: [".ts", ".js", ".json", ".vue"],
            alias: {
                vue$: buildInfo.isDev
                    ? "vue/dist/vue.runtime.esm-browser.js"
                    : "vue/dist/vue.runtime.esm-browser.prod.js",
            },
            plugins: [
                new TsconfigPathsPlugin({
                    configFile: path.resolve(__dirname, "..", "tsconfig.json"),
                }),
            ],
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    exclude: /(node_modules)/,
                    use: [
                        "import-glob",
                        "gnirts-loader",
                        path.resolve(__dirname, "loaders", "inject-globals.js"),
                        {
                            loader: "swc-loader",
                            options: {
                                sourceMaps: buildInfo.isDev,
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
                {
                    test: /\.vue$/,
                    loader: "vue-loader",
                },
                {
                    test: /\.css$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: "css-loader",
                            options: {
                                url: false,
                            },
                        },
                    ],
                },
            ],
        },
        plugins: [
            new FantasticonPlugin({
                config: {
                    name: "fmg-font",
                    prefix: "fmg-icon",
                    tag: "i",
                    inputDir: "./icons",
                    outputDir: "[dist]/assets/font",
                    fontTypes: [FontAssetType.TTF, FontAssetType.WOFF, FontAssetType.WOFF2],
                    assetTypes: [ASSET_TYPES.CSS],
                    formatOptions: {
                        json: { indent: 2 },
                    },
                    pathOptions: {
                        ts: "./src/types/icon-types.ts",
                        json: "./misc/icon-codepoints.json",
                    },
                },
            }),
            new HtmlPlugin({
                chunks: ["popup/index"],
                filename: "popup/index.html",
                template: "./src/popup/index.html",
            }),
            new HtmlPlugin({
                // chunks: ["iframe"],
                chunks: ["storage/offscreen"],
                filename: "storage/offscreen.html",
                template: "./src/contexts/storage/offscreen.html",
            }),
            new MiniCssExtractPlugin({
                filename: "css/[name].css",
            }),
            new VueLoaderPlugin(),
            new CopyPlugin({ patterns: [{ context: "src", from: "assets", to: "assets" }] }),
            new DefinePlugin({
                __BROWSER__: JSON.stringify(buildInfo.browser),
                __VERSION__: JSON.stringify(buildInfo.version),
                __HOMEPAGE__: JSON.stringify(buildInfo.homepage),
                __AUTHOR__: JSON.stringify(buildInfo.author),
                __DEBUG__: buildInfo.isDev,
                __WATCH__: buildInfo.watch,
                __PORT__: PORT,
                __CACHE_MAX_AGE__: CACHE_MAX_AGE,
                __MAX_BACKUPS_COUNT__: MAX_BACKUPS_COUNT,
                //console: "logging",
            }),
            new ProvidePlugin({
                $: "jquery",
                jQuery: "jquery",
                logging: [path.resolve(__dirname, "..", "src", "logging.ts"), "default"],
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
                startUrl: process.env.START_URL ?? "https://mapgenie.io",
                chromiumBinary: process.env.CHROME_BIN,
                sourceDir: buildInfo.out,
                args: buildInfo.isChrome
                    ? ["--auto-open-devtools-for-tabs", "--system-developer-mode", "--start-maximized"]
                    : [],
            }),
        ],
        optimization: {
            splitChunks: {
                filename: "chunks/[name].js",
            },
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
