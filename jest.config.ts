import fs from "node:fs";
import path from "node:path";

import { pathsToModuleNameMapper } from "ts-jest";
import type { Config } from "@jest/types";

function getTsConfig(): any {
    const configPath = path.resolve("tsconfig.json");
    const configBuffer = fs.readFileSync(configPath);
    return JSON.parse(configBuffer.toString());
}

const { compilerOptions } = getTsConfig();
const { paths, baseUrl } = compilerOptions ?? {};

export default {
    verbose: true,
    transform: {
        "\\.ts$": [
            "ts-jest",
            {
                tsconfig: "./tests/tsconfig.json",
                diagnostics: false,
            },
        ],
    },
    roots: ["src"],
    modulePaths: baseUrl ? [baseUrl] : [],
    moduleDirectories: ["node_modules"],
    moduleNameMapper: paths ? pathsToModuleNameMapper(paths, { useESM: true }) : {},
    testEnvironment: "./tests/env/index.ts",
    setupFilesAfterEnv: ["jest-extended/all"],
} satisfies Config.InitialOptions;
