const fs = require("fs");
const path = require("path");

const webpack = require("webpack");

const archiver = require("archiver");
const webExt = require("web-ext");

const CopyPlugin = require("copy-webpack-plugin");
const generate = require('generate-file-webpack-plugin');

const pjson = require("../../package.json");
const createBuildInfo = require("../../build.config.js");

const ENV = require("dotenv").config().parsed || {};

function parseArgv(argv, browser) {
	return { ...argv, browser };
}

function fetchManifest(file) {
    if (fs.existsSync(file)) {
        try {
            return JSON.parse(fs.readFileSync(file));
        }
        catch(e) {
            throw new Error(`Error happend while parsing manifest: ${file}, error: ${e}!`);
        }
    }
	return {};
}

function createFilename(browser, ext) {
	return `fmg-${browser}-v${pjson.version}.${ext}`;
}

function zip(file, dest) {
    const out = fs.createWriteStream(dest);
    const zip = archiver("zip");

    zip.on("error", err => { throw err; });

    zip.pipe(out);
    
    if (fs.statSync(file).isDirectory()) {
        zip.directory(file, false);
    } else {
		const pasrsedPath = path.parse(file);
        zip.append(fs.createReadStream(file), { name: `${pasrsedPath.name}.${pasrsedPath.ext}` });
    }

    return zip.finalize();
}

function createManifest(...objects) {
	return generate({
		file: "manifest.json",
		content: JSON.stringify(Object.assign({}, ...objects), null, 4)
	});
}

function parseEntries(src, entries) {
    const parsedEntries = {};
    for (const to in entries) {
        parsedEntries[to] = path.join(src, entries[to]);
    }
	return parsedEntries;
}

function parseStatic(src, static) {
	const parsedStatic = [];
    for (const to in static) {
        parsedStatic.push({ to, from: path.join(src, static[to]) });
    }
	return parsedStatic;
}

function parseCreate(create) {
	const parsedCreate = [];
	for (const file in create) {
		parsedCreate.push(generate({ file, content: create[file] }));
	}
	return parsedCreate;
}

function build(argv) {

	const { browser, debug, watch } = argv;

	const buildInfo = createBuildInfo(argv);
    
	const src = path.resolve(process.cwd(), buildInfo.src);
    const dist = path.resolve(process.cwd(), buildInfo.dist, browser);

	// cleanup old dir
    if (fs.existsSync(dist)) fs.rmSync(dist, { recursive: true });

	// create new dir
    fs.mkdirSync(dist, { recursive: true });


    const options = {};

    options.mode = debug ? "development" : "none";

    options.entry = parseEntries(src, buildInfo.entry);

    options.plugins = [

		// copy statics
        new CopyPlugin({ patterns: parseStatic(src, buildInfo.static) }),

		// generate files
		...parseCreate(buildInfo.create),

		// create manifest
		createManifest(
			
			// info
			{
				name			: pjson.title,
				version			: pjson.version.match(/\d+\.\d+\.\d+/)?.[0],
				version_name	: pjson.version,
				description		: pjson.description,
				author			: pjson.author,
			},

			// debug
			debug ?
			{
				content_security_policy: "script-src 'self' 'unsafe-eval'; object-src 'self'"
			}
			: {},

			fetchManifest(path.join(src, "manifest.json")),
			browser === "chrome" ? fetchManifest(path.join(src, "manifest_chrome.json")) : {},
			browser === "firefox" ? fetchManifest(path.join(src, "manifest_firefox.json")) : {}, 
		)
    ];

    options.resolve = {
        extensions: [".tsx", ".ts", ".js"],
    },

    options.module = {
        rules: [
            {
                test: /\.tsx?$/,
                use: {
                    loader: "ts-loader",
                    options: {
                        transpileOnly: true,
                    },
                },
                exclude: /node_modules/,
            },
			{
				test: /\.css$/,
				use: 'raw-loader',
			},
        ],
    }
    
    options.output = { path: dist };

	options.watch = watch;

	options.watchOptions = {
		ignored: /node_modules/,
	};
    
    return new Promise((resolve, reject) => {
		webpack(options, (err, stats) => {
			if (err) reject(err);
			// console.log(stats);
			resolve(dist);
		});
	})
}

module.exports.command = "build";
module.exports.describe = "Build the extension";

module.exports.builder = {
	"src": {
		default: path.resolve(process.cwd(), "src"),
		description: "Folder where the source files lives."
	},
	"dist": {
		default: path.resolve(process.cwd(), "dist"),
        description: "Folder to put the builded extensions in."
	},
    "browser": {
        alias: "b",
        default: "chrome-firefox",
        description: "Specify for which browser u want to build \"chrome\", \"firefox\" or both with \"chrome-firefox\"."
    },
    "debug": {
        alias: "d",
        type: "boolean",
        default: false,
        description: "Enabled this when building the extension just for testing. This will not sign the firefox version."
    },
	"port": {
		type: "number",
		default: 5500,
		description: "Port for the WebSocket to use."
	},
    "watch": {
        alias: "w",
        type: "boolean",
        default: false,
        description: "Watch for changes and automaticly rebuilds."
    }
}

module.exports.build = build;


async function buildDistFirefox(argv) {

	argv = parseArgv(argv, "firefox")

	const extensionDir = await build(argv);

	const { KEY: key, SECRET: secret } = ENV;

    const filename = createFilename("firefox", "zip");
    const destFolder = path.dirname(extensionDir);
	const dest = path.resolve(destFolder, filename);

    if (fs.existsSync(dest)) {
        fs.rmSync(dest, { force: true });
    }

	if (!argv.debug && !(key && secret)) {
		throw new Error("No key or secret given!");
	}

    await (argv.debug ? webExt.cmd.build : webExt.cmd.sign)({
        apiKey: key,
        apiSecret: secret,
        sourceDir: extensionDir,
        channel: "unlisted",
        artifactsDir: destFolder,
        overwriteDest: true,
        filename: filename,
    }).then((result) => {
        const file = result.downloadedFiles?.[0];
        if (file) {
            return zip(file, dest);//.then(() => fs.rmSync(file));
        }
    });
}

async function watchDistFirefox(argv) {

	argv = parseArgv(argv, "firefox");

	const extensionDir = await build(argv);

	await webExt.cmd.run({
		sourceDir: extensionDir
	}, {
		// buildExtension: () => build(argv),
		getValidatedManifest: () => ({
			name: pjson.name,
			version: pjson.version,
		}),
		shouldExitProgram: false,
	});
}

async function buildDistChrome(argv) {

	argv = parseArgv(argv, "chrome")

	const extensionDir = await build(argv);

	// if  in debug mode don't zip the extension
    if (argv.debug) return;

	const dest = path.resolve(path.dirname(extensionDir), createFilename("chrome", "zip"));

    if (fs.existsSync(dest)) {
        fs.rmSync(dest, { force: true });
    }

    await zip(extensionDir, dest);
}

async function watchDistChrome(argv) {
	await build(argv);
}

module.exports.handler = async function(argv) {
    const { browser } = argv;

	const p = [];

	if (browser.match("chrome")) {
		if (argv.watch) {
			p.push(watchDistChrome(argv));
		} else {
			p.push(buildDistChrome(argv));
		}
	}

	if (browser.match("firefox")) {
		if (argv.watch) {
			p.push(watchDistFirefox(argv));
		} else {
			p.push(buildDistFirefox(argv));
		}
	}

	return Promise.all(p)
		.catch(e => console.error("[BUILD ERROR]:", e));
};