import fs from "fs";
import path from "path";

/**
 * Get tsconfig.json
 * @returns {import("typescript")}
 */
function getTsConfig() {
    const configPath = path.resolve("tsconfig.json");
    const configBuffer = fs.readFileSync(configPath);
    return JSON.parse(configBuffer.toString());
}

/**
 * Convert tsconfig.json path alias to jest path alias
 * @param {string} baseUrl
 * @param {string} alias
 * @param {string[]} path
 * @returns {[string, string]}
 * @example
 * convertTsPathAliasToJestPathAlias("./", "@/*", ["src/*"]) // ["^@/(.*)$", "<rootDir>/src/$1"]
 */
function convertTsPathAliasToJestPathAlias(baseUrl, alias, path) {
    return [
        "^" + alias.replace("/*", "/(.*)") + "$",
        baseUrl.replace("./", "<rootDir>/") + "/" + path[0].replace("*", "$1")
    ];
}

/**
 * Get moduleNameMapper from tsconfig.json
 * @returns {import("@jest/types").Config.InitialOptions["moduleNameMapper"]}
 */
function getModuleNameMapper() {
    const config = getTsConfig();
    const { paths, baseUrl } = config.compilerOptions;
    if (!paths) return {};
    const nameMapper = {};
    for (const [alias, path] of Object.entries(paths)) {
        const [newAlias, newPath] = convertTsPathAliasToJestPathAlias(
            baseUrl ?? "./",
            alias,
            path
        );
        nameMapper[newAlias] = newPath;
    }
    return nameMapper;
}

/** @type {import("@jest/types").Config.InitialOptions} */
export default {
    verbose: true,
    silent: false,
    transform: {
        "\\.ts$": "ts-jest"
    },
    roots: ["tests"],
    modulePaths: ["src"],
    moduleDirectories: ["node_modules"],
    moduleNameMapper: getModuleNameMapper()
};
