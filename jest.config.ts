import * as fs from "fs";
import * as path from "path";

import { pathsToModuleNameMapper } from "ts-jest";

function getTsConfig(): any {
    const configPath = path.resolve("tsconfig.json");
    const configBuffer = fs.readFileSync(configPath);
    return JSON.parse(configBuffer.toString());
}

const { compilerOptions } = getTsConfig();
const { paths, baseUrl } = compilerOptions ?? {};

/** @type {import("@jest/types").Config.InitialOptions} */
export default {
    verbose: true,
    transform: {
        "\\.ts$": [
            "ts-jest",
            {
                tsconfig: "./tests/tsconfig.json",
                diagnostics: false
            }
        ]
    },
    roots: ["tests"],
    modulePaths: baseUrl ? [baseUrl] : [],
    moduleDirectories: ["node_modules"],
    moduleNameMapper: paths ? pathsToModuleNameMapper(paths) : [],
    testEnvironment: "./tests/env/main.ts"
};
