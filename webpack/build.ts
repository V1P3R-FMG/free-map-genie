import path from "node:path";
import fs from "fs-extra";
import webpack from "webpack";
import "dotenv/config";

import getBuildInfo, { type BuildInfo } from "./buildInfo.js";
import WebExtManifestPlugin from "./plugins/web-ext-manifest.js";

import { TsconfigPathsPlugin } from "tsconfig-paths-webpack-plugin";
import CopyPlugin from "copy-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";

import startServer from "./server.js";

const { ProvidePlugin, DefinePlugin } = webpack;

const __dirname = import.meta.dirname;
const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;
const CACHE_MAX_AGE = process.env.PORT ? Number(process.env.PORT) : 30 * 60 * 1000;
const MAX_BACKUPS_COUNT = process.env.MAX_BACKUPS_COUNT ? Number(process.env.MAX_BACKUPS_COUNT) : 10;

async function webpackPromise(options: webpack.Configuration) {
    return new Promise((resolve, reject) => {
        const compiler = webpack(options, (err, stats) => {
            if (err || stats.hasErrors()) reject({ err, stats });
            else resolve(stats);
        });

        compiler.hooks.afterCompile.tap("fmg::build", (compilation) => {
            console.log(
                compilation.getStats().toString({
                    colors: true,
                })
            );
        });

        if (options.watch && options.mode === "development") {
            startServer(PORT);
        }
    });
}

function swcLoader(buildInfo: BuildInfo) {
    return {
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
    };
}

function defines(buildInfo: BuildInfo) {
    return new DefinePlugin({
        __BROWSER__: JSON.stringify(buildInfo.browser),
        __VERSION__: JSON.stringify(buildInfo.version),
        __HOMEPAGE__: JSON.stringify(buildInfo.homepage),
        __AUTHOR__: JSON.stringify(buildInfo.author),
        __DEBUG__: buildInfo.isDev,
        __WATCH__: buildInfo.watch,
        __PORT__: PORT,
        __CACHE_MAX_AGE__: CACHE_MAX_AGE,
        __MAX_BACKUPS_COUNT__: MAX_BACKUPS_COUNT,
        console: "logger",
    });
}

function copies(buildInfo: BuildInfo) {
    const patterns = [];

    const gamesJsonPath = path.resolve(__dirname, "..", "data", "games.json");
    if (buildInfo.isDev && fs.existsSync(gamesJsonPath)) {
        patterns.push({ from: gamesJsonPath });
    }

    patterns.push({ context: "src", from: "assets", to: "assets" });

    return new CopyPlugin({ patterns });
}

function provides(_buildInfo: BuildInfo) {
    return new ProvidePlugin({
        $: "jquery",
        jQuery: "jquery",
        logger: [path.resolve(__dirname, "..", "src", "logger.ts"), "default"],
    });
}

async function webExtPlugin(buildInfo: BuildInfo) {
    const plugin = await import("web-ext-plugin");

    return new plugin.default({
        artifactsDir: buildInfo.out,
        target: buildInfo.isChrome ? "chromium" : "firefox-desktop",
        buildPackage: !buildInfo.watch && !buildInfo.isDev,
        outputFilename: buildInfo.isDev ? buildInfo.name : buildInfo.name + (buildInfo.isChrome ? ".zip" : ".xpi"),
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
    });
}

function webExtManifestPlugin(buildInfo: BuildInfo) {
    return new WebExtManifestPlugin({
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
    });
}

async function build() {
    const buildInfo = getBuildInfo(path.resolve(__dirname, "..", "build"));

    if (fs.existsSync(buildInfo.out)) {
        fs.rmSync(buildInfo.out, { recursive: true });
    }

    await webpackPromise({
        entry: {
            extension: "./src/contexts/extension/index.ts",
            background: "./src/contexts/background/index.ts",
            content: "./src/contexts/content/index.ts",
            iframe: "./src/contexts/iframe/index.ts",
        },
        output: { path: buildInfo.out },
        resolve: {
            extensions: [".ts", ".js", ".json"],
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
                    use: swcLoader(buildInfo),
                },
            ],
        },
        plugins: [
            defines(buildInfo),
            copies(buildInfo),
            provides(buildInfo),
            webExtManifestPlugin(buildInfo),
            await webExtPlugin(buildInfo),
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
    });
}

build().catch(console.error);
