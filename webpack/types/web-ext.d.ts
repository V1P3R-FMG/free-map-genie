declare module "web-ext" {
    export interface BuildOptions {
        artifactsDir?: string;
        firefoxPreview?: ["mv3"];
        filename?: string;
        overwriteDest?: boolean;
        sourceDir?: string;
        ignoreFiles?: string[];
    }

    export const cmd: {
        build(buildOptions: BuildOptions, options?: { shouldExitProgram?: boolean }): Promise<void>;
    };
}
