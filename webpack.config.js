import path from "path";
import url from "url";
import fs from "fs";

import dotenv from "dotenv";
dotenv.config();

import HtmlWebpackPlugin from "html-webpack-plugin";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";
import ForkTsCheckerPlugin from "fork-ts-checker-webpack-plugin";
import WebpackExtensionManifestPlugin from "webpack-extension-manifest-plugin";
import WebExtPlugin from "web-ext-plugin";
import CopyPlugin from "copy-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import { SwcMinifyWebpackPlugin } from "swc-minify-webpack-plugin";
import { VueLoaderPlugin } from "vue-loader";

import webpack from "webpack";
const { DefinePlugin, ProvidePlugin } = webpack;

const packageJson = JSON.parse(
    fs.readFileSync("./package.json", { encoding: "utf-8" }).toString()
);

/**
 * Get the environment variable from the webpack env
 * @param {Record<string, any>} env
 * @param {string} name
 * @param {string[]} matches
 * @returns The value of the environment variable
 */
function getEnvVar(env, name, matches) {
    const value = env[name];
    if (!value)
        throw new Error(
            `No ${name} specified. Use --env ${name}=${matches.join(" or ")}`
        );
    if (!matches.includes(value))
        throw new Error(
            `Invalid ${name} specified. Use --env ${name}=${matches.join(
                " or "
            )}`
        );
    return value;
}

/**
 * Parse the mode from the webpack env
 * @param {string} mode The mode to parse
 * @returns The parsed mode
 */
function parseMode(mode) {
    return (
        { dev: "development", prod: "production" }[mode] ||
        mode ||
        "development"
    );
}

/**
 * Create the path to the dist folder
 * @param {string} browser The browser to create the path for
 * @param {string} mode The mode to create the path for
 * @returns The path to the dist folder
 */
function distPath(browser, mode) {
    const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
    return path.resolve(
        __dirname,
        "dist",
        `fmg-${browser}-v${packageJson.version}${
            mode === "development" ? "-dev" : ""
        }`
    );
}

/** @returns {import("webpack").Configuration} */
export default (env) => {
    const hostname = process.env.HOSTNAME || "localhost";
    const port = JSON.parse(process.env.PORT || 3000);
    const watch = env.WEBPACK_WATCH || false;

    const browser = getEnvVar(env, "browser", ["chrome", "firefox"]);
    const mode = parseMode(getEnvVar(env, "mode", ["dev", "prod"]));

    const isDev = mode !== "production";

    const dist = distPath(browser, mode);

    const GLOBALS = {
        __HOSTNAME__: JSON.stringify(hostname),
        __PORT__: port,
        __WATCH__: watch,
        __BROWSER__: JSON.stringify(browser),
        __MODE__: JSON.stringify(mode),
        __DEBUG__: isDev,
        __VERSION__: JSON.stringify(packageJson.version),
        __AUTHOR__: JSON.stringify(packageJson.author),
        __HOMEPAGE__: JSON.stringify(packageJson.homepage)
    };

    const files = [
        { from: "./src/icons", to: "icons" },
        { from: "./src/popup/font", to: "font" }
    ];

    // Add the blocklist for chrome
    if (browser === "chrome") {
        files.push({ from: "./src/rules.json", to: "rules.json" });
    }

    // Configure the webpack
    return {
        mode,
        devtool: isDev ? "cheap-module-source-map" : undefined,
        entry: {
            extension: "./src/extension/index.ts",
            content: "./src/content/index.ts",
            "popup/index": "./src/popup/index.ts",
            background: "./src/background/index.ts"
        },
        output: {
            path: dist
        },
        resolve: {
            extensions: [".ts", ".json", ".vue"],
            alias: {
                vue$: isDev
                    ? "vue/dist/vue.runtime.esm-browser.js"
                    : "vue/dist/vue.runtime.esm-browser.prod.js",
                logger: path.resolve("./src/fmg/logger.ts")
            },
            plugins: [new TsconfigPathsPlugin()]
        },
        module: {
            rules: [
                {
                    test: /\.ts?$/,
                    exclude: /node_modules/,
                    use: [
                        "import-glob",
                        {
                            loader: "swc-loader",
                            options: {
                                jsc: {
                                    parser: {
                                        syntax: "typescript"
                                    },
                                    target:"esnext"
                                }
                            }
                        },
                        {
                            loader: "ifdef-loader",
                            options: {
                                DEBUG: isDev,
                                BROWSER: browser,
                                VERSION: packageJson.version,
                                CHROME: browser === "chrome",
                                FIREFOX: browser === "firefox"
                            }
                        }
                    ]
                },
                {
                    test: /\.vue$/,
                    loader: "vue-loader"
                },
                {
                    test: /\.css$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: "css-loader",
                            options: {
                                url: false
                            }
                        }
                    ]
                },
                {
                    test: /\.s[ac]ss/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: "css-loader",
                            options: {
                                url: false
                            }
                        },
                        "sass-loader"
                    ]
                }
            ]
        },
        plugins: [
            // Extract the css to a separate file
            new MiniCssExtractPlugin(),

            // Popup html file
            new HtmlWebpackPlugin({
                chunks: ["popup/index"],
                filename: "popup/index.html",
                template: "./src/popup/index.html"
            }),

            // Provide global modules
            new ProvidePlugin({
                logger: "logger"
            }),

            // Provide the global variables
            new DefinePlugin(GLOBALS),

            // Static files to copy to the dist folder
            new CopyPlugin({ patterns: files }),

            // Vue loader
            new VueLoaderPlugin(),

            // Lint the typescript
            new ForkTsCheckerPlugin(),

            // Generate the manifest
            new WebpackExtensionManifestPlugin({
                config: {
                    base: "./src/manifest.json",
                    extend: `./src/manifest.${browser}.json`
                },
                pkgJsonProps: ["version", "description", "author", "name"]
            }),

            // Generate the extension
            new WebExtPlugin({
                sourceDir: dist,
                artifactsDir: dist,
                outputFilename: `fmg-${browser}-v${packageJson.version}`,
                target: browser === "chrome" ? "chromium" : "firefox-desktop",
                devtools: true,
                selfHosted: true,
                firefoxProfile: process.env.FIREFOX_PROFILE,
                chromiumProfile: process.env.CHROMIUM_PROFILE,
                keepProfileChanges: process.env.KEEP_PROFILE_CHANGES === "true",
                startUrl: process.env.START_URL || "https://mapgenie.io/",
                runLint: false,
                buildPackage: !env.package
            })
        ],
        watch,
        watchOptions: {
            ignored: /node_modules/,
            aggregateTimeout: 300,
            poll: 1000
        },
        optimization: {
            minimize: !isDev,
            minimizer: [new SwcMinifyWebpackPlugin()]
        }
    };
};
