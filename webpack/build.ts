import fs from "fs-extra";

import webpack from "webpack";

import startServer from "./server.js";
import getConfig, { PORT } from "./config.js";

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

async function build() {
    const config = await getConfig();

    if (config.output?.path && fs.existsSync(config.output.path)) {
        fs.rmSync(config.output.path, { recursive: true });
    }

    await webpackPromise(config);
}

build().catch(console.error);
