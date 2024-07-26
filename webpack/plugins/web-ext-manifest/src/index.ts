import webpack, { type Compilation, type Compiler } from "webpack";
import { validate } from "schema-utils";
import merge from "deepmerge";
import path from "node:path";
import fs from "node:fs";

const { WebpackError } = webpack;

type Schema = Parameters<typeof validate>[0];

const schema: Schema = {
    type: "object",
    required: ["files"],
    properties: {
        files: {
            type: "array",
            items: { anyOf: [{ type: "object" }, { type: "string" }] },
            description: "Merges the given object and file paths into a single manifest.",
        },
        fields: {
            type: "array",
            items: { type: "string" },
            description: "Adds specified properties from your package.json file into the manifest.",
        },
        tabs: {
            type: "number",
            description: "Controls the generated manfiest tab size.",
        },
    },
    additionalProperties: false,
};

export type Manifest = chrome.runtime.Manifest;
export type ManifestPath = string;
export type ManifestEntry = Partial<Manifest> | ManifestPath;

export interface WebExtManifestPluginOptions {
    /** manifest file paths or objects to merge as a single manifest */
    files: ManifestEntry[];
    /** package.json fields to copy */
    fields?: string[];
    /** tab size for generated manifest (default: null), null is minified */
    tabs?: number;
}

function createSource(source: string): any {
    return {
        source: () => source,
        size: () => source.length,
    };
}

export default class WebExtManifestPlugin {
    private readonly options: WebExtManifestPluginOptions;

    public constructor(options: WebExtManifestPluginOptions) {
        validate(schema, options, { name: WebExtManifestPlugin.name });
        this.options = options;
    }

    private requireWatch(compilation: Compilation, id: string): Manifest {
        const idPath = path.resolve(process.cwd(), id);
        compilation.fileDependencies.add(idPath);
        try {
            if (fs.existsSync(idPath)) {
                return JSON.parse(fs.readFileSync(idPath, "utf-8"));
            } else {
                compilation.warnings.push(new WebpackError(`file: ${idPath} does not exist.`));
                return {} as Manifest;
            }
        } catch (e) {
            compilation.errors.push(new WebpackError(`${e}`));
        }
    }

    private resolveManifest(compilation: Compilation, manifest: ManifestEntry): Partial<Manifest> {
        if (typeof manifest !== "string") {
            return manifest;
        }
        return this.requireWatch(compilation, manifest);
    }

    private getPackagesValues(compilation: Compilation): Partial<Manifest> {
        if (this.options.fields?.length) {
            const pkg = this.requireWatch(compilation, "package.json");
            return Object.fromEntries(this.options.fields.map((field) => [field, pkg[field]]));
        }
        return {};
    }

    private generateJson(compilation: Compilation): string {
        const json = [this.options.files, this.getPackagesValues(compilation)]
            .flat()
            .map((file) => this.resolveManifest(compilation, file))
            .reduce((prev, cur) => merge<Manifest>(prev, cur));
        return JSON.stringify(json, null, this.options.tabs);
    }

    public apply(compiler: Compiler) {
        compiler.hooks.thisCompilation.tap(WebExtManifestPlugin.name, (compilation: Compilation) => {
            compilation.hooks.processAssets.tap(
                {
                    name: WebExtManifestPlugin.name,
                    stage: compilation["PROCESS_ASSETS_STAGE_ADDITIONS"],
                },
                (_) => {
                    const jsonString = this.generateJson(compilation);
                    compilation.emitAsset("manifest.json", createSource(jsonString));
                }
            );
        });
    }
}
