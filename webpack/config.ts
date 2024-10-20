import path from "node:path";
import webpack from "webpack";
import { FontAssetType, ASSET_TYPES } from "fantasticon";
import "dotenv/config";

import * as env from "./env.js";
import getBuildInfo, { type BuildInfo } from "./buildInfo.js";
import WebExtManifestPlugin from "./plugins/web-ext-manifest.js";
import FantasticonPlugin from "./plugins/fantasticon.js";

import HtmlPlugin from "html-webpack-plugin";
import CopyPlugin from "copy-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import { TsconfigPathsPlugin } from "tsconfig-paths-webpack-plugin";
import { VueLoaderPlugin } from "vue-loader";
import AdbPlugin from "./plugins/adb.js";

const { ProvidePlugin, DefinePlugin } = webpack;

const __dirname = import.meta.dirname;

export const PORT = env.getNumber("PORT", 8080);
export const CACHE_MAX_AGE = env.getNumber("CACHE_MAX_AGE", 5 * 60 * 1000);
export const MAX_BACKUPS_COUNT = env.getNumber("MAX_BACKUPS_COUNT", 10);

export interface Config {
    buildInfo: BuildInfo;
    webpackConfig: webpack.Configuration;
}

async function getWebpackConfig({
    isChrome,
    isFirefox,
    isDev,
    isMobile,
    watch,
    mode,
    browser,
    out,
    outFile,
    version,
    homepage,
    author,
}: BuildInfo): Promise<webpack.Configuration> {
    const { default: WebExtPlugin } = await import("web-ext-plugin");

    return {
        entry: {
            "extension": "./src/contexts/extension/index.ts",
            "background": "./src/contexts/background/index.ts",
            "content": "./src/contexts/content/index.ts",
            "storage/main": "./src/contexts/storage/main.ts",
            "popup/index": "./src/popup/index.ts",
        },
        output: {
            path: out,
        },
        resolve: {
            extensions: [".ts", ".js", ".json", ".vue"],
            alias: {
                vue$: isDev ? "vue/dist/vue.runtime.esm-browser.js" : "vue/dist/vue.runtime.esm-browser.prod.js",
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
                                sourceMaps: isDev,
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
                    descent: 50,
                    fontTypes: [FontAssetType.TTF, FontAssetType.WOFF, FontAssetType.WOFF2],
                    assetTypes: [ASSET_TYPES.CSS],
                },
            }),
            new HtmlPlugin({
                chunks: ["popup/index"],
                filename: "popup/index.html",
                template: "./src/popup/index.html",
            }),
            new HtmlPlugin({
                chunks: isFirefox ? ["background"] : [],
                filename: "storage/background.html",
                template: "./src/contexts/storage/background.html",
            }),
            new MiniCssExtractPlugin({
                filename: "css/[name].css",
            }),
            new VueLoaderPlugin(),
            new CopyPlugin({ patterns: [{ context: "src", from: "assets", to: "assets" }] }),
            new DefinePlugin({
                __BROWSER__: JSON.stringify(browser),
                __VERSION__: JSON.stringify(version),
                __HOMEPAGE__: JSON.stringify(homepage),
                __AUTHOR__: JSON.stringify(author),
                __IS_MOBILE__: isMobile,
                __DEBUG__: isDev,
                __WATCH__: watch,
                __PORT__: PORT,
                __HOSTNAME__: JSON.stringify(env.getString("IP", "localhost")),
                __CACHE_MAX_AGE__: CACHE_MAX_AGE,
                __MAX_BACKUPS_COUNT__: MAX_BACKUPS_COUNT,
                __OVERRIDE_SERVER_URL__: env.getJsonStringify("OVERRIDE_SERVER_URL", "undefined"),
                //console: "logging",
            }),
            new ProvidePlugin({
                $: "jquery",
                jQuery: "jquery",
                logging: [path.resolve(__dirname, "..", "src", "logging.ts"), "default"],
            }),
            new WebExtManifestPlugin({
                files: ["./src/manifest.json", `./src/manifest.${browser}.json`],
                fields: ["version", "author", "name"],
                tabs: 2,
            }),
            isChrome && isMobile
                ? new AdbPlugin({
                      sourceDir: out,
                      artifactsDir: path.dirname(out),
                      outFilename: path.join(path.dirname(out), outFile),
                      device: env.getString("ANDROID_DEVICE"),
                      overwriteDest: true,
                  })
                : new WebExtPlugin({
                      adbHost: env.getString("ADB_HOST"),
                      adbPort: env.getString("ADB_PORT"),
                      adbBin: env.getString("ADB_BIN"),
                      adbDevice: env.getString("ANDROID_DEVICE"),
                      artifactsDir: path.dirname(out),
                      outputFilename: outFile,
                      target: isChrome ? "chromium" : isMobile ? "firefox-android" : "firefox-desktop",
                      buildPackage: !watch && !isDev,
                      runLint: false,
                      selfHosted: true,
                      overwriteDest: true,
                      devtools: true,
                      startUrl: env.getString("START_URL", "https://mapgenie.io"),
                      chromiumBinary: env.getString("CHROME_BIN"),
                      firefox: env.getString("FIREFOX_BIN"),
                      firefoxApk: env.getString("FIREFOX_APK"),
                      sourceDir: out,
                      args: isChrome
                          ? ["--auto-open-devtools-for-tabs", "--system-developer-mode", "--start-maximized"]
                          : [],
                      profileCreateIfMissing: false,
                      chromiumProfile: env.getString("CHROMIUM_PROFILE"),
                      firefoxProfile: env.getString("FIREFOX_PROFILE"),
                      keepProfileChanges: env.getString("KEEP_CHANGES", "0").toLowerCase() in [1, "1", "true"],
                  }),
        ],
        optimization: {
            splitChunks: {
                filename: "chunks/[name].js",
            },
            minimize: !isDev,
            minimizer: [new TerserPlugin()],
        },
        watch,
        devtool: isDev ? "inline-cheap-module-source-map" : false,
        watchOptions: {
            ignored: "node_modules",
            poll: 1000,
            aggregateTimeout: 300,
        },
        mode,
    };
}

export default async function getConfig(): Promise<Config> {
    const buildInfo = getBuildInfo(path.resolve(__dirname, "..", "build"));
    return {
        buildInfo,
        webpackConfig: await getWebpackConfig(buildInfo),
    };
}
