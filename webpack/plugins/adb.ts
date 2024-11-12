import path from "node:path";

import webpack from "webpack";
import { validate } from "schema-utils";
import { type WebSocket, WebSocketServer } from "ws";
import webExt from "web-ext";
import { CommandBuilder } from "../cmd.js";

type Schema = Parameters<typeof validate>[0];

const schema: Schema = {
    type: "object",
    required: ["sourceDir", "artifactsDir", "outFilename"],
    properties: {
        apk: {
            type: "string",
            description: "Apk vendor name",
        },
        sourceDir: {
            type: "string",
            description: "Source location of the extension.",
        },
        artifactsDir: {
            type: "string",
            description: "Output location for artifacts out files.",
        },
        outFilename: {
            type: "string",
            description: "Filename of the output file.",
        },
        ignoreFiles: {
            type: "array",
            items: { type: "string" },
            description: "Files to ignore",
        },
        targetPath: {
            type: "string",
            description: "Target path on the device.",
        },
        verbose: {
            type: "boolean",
            description: "Enable/Disable console output.",
        },
        device: {
            type: "string",
            description: "Device to execute adb command on.",
        },
        overwriteDest: {
            type: "boolean",
            description: "Overwrite destination file.",
        },
        bin: {
            type: "string",
            description: "Path to the adb binary.",
        },
    },
    additionalProperties: false,
};

export interface AdbPluginOptions {
    verbose?: boolean;
    sourceDir: string;
    artifactsDir: string;
    outFilename: string;
    ignoreFiles?: string[];
    targetPath?: string;
    device?: string;
    overwriteDest?: boolean;
    bin?: string;
    apk?: string;
}

export interface AdbPluginOptionsWithDefaults extends AdbPluginOptions {
    verbose: boolean;
    targetPath: string;
    apk: string;
}

export interface ShellLsCmdOptions {
    list: boolean;
    all: boolean;
}

export default class AdbPlugin {
    private options: AdbPluginOptionsWithDefaults;

    private wss: WebSocketServer;
    private clients: Set<WebSocket> = new Set();

    constructor(options: AdbPluginOptions) {
        validate(schema, options, { name: AdbPlugin.name });
        this.options = Object.assign(
            {
                verbose: true,
                targetPath: this.downloadDirectory + path.basename(options.outFilename),
                apk: "com.kiwibrowser.browser",
            },
            options
        );
    }

    public apply(compiler: webpack.Compiler) {
        compiler.hooks.afterEmit.tapPromise("AdbPlugin", async () => {
            await this.buildExtension();
            this.pushFile(this.options.outFilename, this.options.targetPath);
            this.updateFile();
        });
    }

    private get downloadDirectory() {
        return "/storage/self/primary/Download/";
    }

    private get unpackedExtensionRootDirectory() {
        return `/data/data/${this.options.apk}/app_chrome/Default/UnpackedExtensions/`;
    }

    private get updateFileBashFile() {
        return path.join(__dirname, "update.sh");
    }

    private notifyReload() {
        this.clients.forEach((client) => client.send(JSON.stringify({ type: "reload" })));
    }

    private async buildExtension() {
        await webExt.cmd.build(
            {
                sourceDir: this.options.sourceDir,
                artifactsDir: this.options.artifactsDir,
                filename: path.basename(this.options.outFilename),
                ignoreFiles: this.options.ignoreFiles,
                overwriteDest: this.options.overwriteDest ?? false,
            },
            { shouldExitProgram: true }
        );
    }

    private adbCommand() {
        return CommandBuilder.command(this.options.bin ?? "adb")
            .startIf()
            .args("-s", this.options.device)
            .endIf(!!this.options.device);
    }

    private pushFile(src: string, dest: string) {
        try {
            const result = this.adbCommand().arg("push").argString(src).argString(dest).execSyncUtf8();

            if (this.options.verbose) {
                console.log("Pushed file:\n  ", result.trimEnd());
            }
        } catch (err) {
            console.error("Push file failed:", `${err}`);
        }
    }

    private cpFile(src: string, dest: string) {
        try {
            this.adbCommand().arg("shell").argString(`su -c 'cp -r "${src}" "${dest}"'`).execSync();

            if (this.options.verbose) {
                console.log("Copied File:", "\n  from:", src, "\n  to:", dest);
            }
        } catch (err) {
            console.error("Copy file failed:", `${err}`);
        }
    }

    private rmFile(src: string) {
        try {
            this.adbCommand().arg("shell").argString(`su -c 'rm -rf "${src}"'`).execSync();

            if (this.options.verbose) {
                console.log("Removed File:\n  ", src);
            }
        } catch (err) {
            console.error("Copy file failed:", `${err}`);
        }
    }

    private chownFile(src: string, user: string, group: string) {
        try {
            this.adbCommand().arg("shell").argString(`su -c 'chown -R ${user}:${group} ${src}'`);

            if (this.options.verbose) {
                console.log("Chowned File:\n  ", src);
            }
        } catch (err) {
            console.error("Chown file failed:", `${err}`);
        }
    }

    private getAllUnpackedExtensionDirectories() {
        try {
            return this.adbCommand()
                .arg("shell")
                .argString(`su -c 'ls "${this.unpackedExtensionRootDirectory}"'`)
                .execSyncUtf8()
                .split("\n")
                .slice(0, -1)
                .map((dir) => dir.trimEnd());
        } catch (err) {
            console.error("command result:", `${err}`);
            return [];
        }
    }

    private getCurrentUnpackedExtensionDirectory() {
        const filename = path.basename(this.options.outFilename);
        const directories = this.getAllUnpackedExtensionDirectories();
        const matches = directories.filter((dir) => dir.startsWith(filename));

        if (!matches.length) {
            return null;
        }

        if (matches.length > 1) {
            console.error("More than 1 valid unpacked extension directory found.");
            return null;
        }

        return `${this.unpackedExtensionRootDirectory}${matches[0]}`;
    }

    private updateFile() {
        const dir = this.getCurrentUnpackedExtensionDirectory();

        if (!dir) {
            console.log("Extension directory not found.");
            return null;
        }

        const filename = path.basename(this.options.outFilename);
        const tmpPath = `${this.downloadDirectory}${filename}-tmp`;

        this.rmFile(tmpPath);
        this.pushFile(`${this.options.sourceDir}`, tmpPath);
        this.cpFile(`${tmpPath}/*`, `${dir}/`);
        this.chownFile(`${dir}/`, "root", "everybody");
    }
}
