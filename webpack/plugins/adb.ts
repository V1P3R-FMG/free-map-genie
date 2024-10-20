import path from "node:path";

import { execSync } from "child_process";
import webpack from "webpack";
import { validate } from "schema-utils";
import { type WebSocket, WebSocketServer } from "ws";

import webExt from "web-ext";

type Schema = Parameters<typeof validate>[0];

const schema: Schema = {
    type: "object",
    required: ["sourceDir", "artifactsDir", "outFilename"],
    properties: {
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
}

export interface AdbPluginOptionsWithDefaults extends AdbPluginOptions {
    verbose: boolean;
    targetPath: string;
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
                targetPath: "/storage/self/primary/Download/" + path.basename(options.outFilename),
            },
            options
        );
    }

    public apply(compiler: webpack.Compiler) {
        compiler.hooks.afterEmit.tapAsync("AdbPlugin", async () => {
            await this.buildExtension();
            this.writeFile();
            this.notifyReload();
        });
    }

    private notifyReload() {
        this.clients.forEach((client) => client.send(JSON.stringify({ type: "reload" })));
    }

    private async buildExtension() {
        await webExt.cmd.build({
            sourceDir: this.options.sourceDir,
            artifactsDir: this.options.artifactsDir,
            filename: path.basename(this.options.outFilename),
            ignoreFiles: this.options.ignoreFiles,
            overwriteDest: this.options.overwriteDest ?? false,
        });
    }

    private writeFile() {
        try {
            const cmdComponents = [this.options.bin ?? "adb"];

            if (this.options.device) {
                cmdComponents.push("-s", this.options.device);
            }

            cmdComponents.push("push", `"${this.options.outFilename}"`, `"${this.options.targetPath}"`);

            const result = execSync(cmdComponents.join(" "));

            if (this.options.verbose) console.log("command result:", result.toString("utf-8"));
        } catch (err) {
            if (this.options.verbose) console.log("command result:", `${err}`);
        }
    }
}
