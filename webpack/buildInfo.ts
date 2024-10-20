import path from "node:path";
import fs from "node:fs";

export interface GeneratedKeys {
    appId: string;
    private: string;
    public: string;
    privateKeyFilePath: string;
    publicKeyFilePath: string;
    appIdFilePath: string;
}

export type Browser = "chrome" | "firefox";

export type Mode = "development" | "production";

export interface EnvInfo {
    isChrome: boolean;
    isFirefox: boolean;
    isMobile: boolean;
    isDev: boolean;
    browser: Browser;
    mode: Mode;
    watch: boolean;
}

export interface PackageJsonInfo {
    version: string;
    homepage: string;
    author: string;
}

export interface BuildInfo extends EnvInfo, PackageJsonInfo {
    name: string;
    out: string;
    outFile: string;
}

export interface CopyInstructionToArgs {
    context: string;
    absoluteFilename: string;
}

export interface CopyInstruction {
    from: string;
    context: string;
    to?: string | ((args: CopyInstructionToArgs) => string);
}

function getEnvInfo(): EnvInfo {
    const isChrome = !!process.argv.find((arg) => arg === "chrome");
    const isFirefox = !!process.argv.find((arg) => arg === "firefox");
    const isMobile = !!process.argv.find((arg) => arg === "mobile");
    const isDev = !!process.argv.find((arg) => arg === "dev");
    const watch = !!process.argv.find((arg) => arg === "--watch" || arg === "-w");

    if (!isChrome && !isFirefox) throw "No browser provided pls add `chrome` or `firefox`.";
    if (isChrome && isFirefox) throw "More than one browser provided, You can only bundle one at a time.";

    // if (isChrome && isMobile) throw "Chrome does not support mobile.";

    return {
        isChrome,
        isFirefox,
        isMobile,
        isDev,
        browser: isChrome ? "chrome" : "firefox",
        mode: isDev ? "development" : "production",
        watch,
    };
}

function getPackageJsonInfo(): PackageJsonInfo {
    const pkg = JSON.parse(fs.readFileSync("./package.json", "utf-8"));
    const version = pkg.version;
    const homepage = pkg.homepage;
    const author = pkg.author;

    if (!version) throw "Package has no `version` value pls provide one.";
    if (!homepage) throw "Package has no `homepage` value pls provide one.";
    if (!author) throw "Package has no `author` value pls provide one.";

    return { version, homepage, author };
}

export default function getBuildInfo(dist: string): BuildInfo {
    const envInfo = getEnvInfo();
    const name = `fmg-${envInfo.browser}`;

    const outFile =
        envInfo.isDev && !(envInfo.isChrome && envInfo.isMobile) ? name : name + (envInfo.isChrome ? ".zip" : ".xpi");

    return {
        name,
        out: path.resolve(dist, name),
        outFile,
        ...envInfo,
        ...getPackageJsonInfo(),
    };
}
