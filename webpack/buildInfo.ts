import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";

const HEX_MAP = "0123456789abcdef";
const CHAR_MAP = "abcdefghijklmnop";

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
    keys: GeneratedKeys;
    name: string;
    out: string;
    updateUrl: string;
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

function generateKeys(keyDir: string): GeneratedKeys {
    const privateKeyFilePath = path.resolve(keyDir, "key.pem");
    const publicKeyFilePath = path.resolve(keyDir, "key.pub");
    const appIdFilePath = path.resolve(keyDir, "appid");

    let privateKeyData: string, publicKeyData: string, appIdData;
    if (!fs.existsSync(privateKeyFilePath) || !fs.existsSync(publicKeyFilePath) || !fs.existsSync(appIdFilePath)) {
        if (fs.existsSync(keyDir)) {
            fs.rmSync(keyDir);
        }

        fs.mkdirSync(keyDir, { recursive: true });

        const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
            modulusLength: 2048,
        });

        const privateKeyBuf = privateKey.export({
            type: "pkcs8",
            format: "pem",
        });
        const publicKeyBuf = publicKey.export({ type: "spki", format: "der" });

        privateKeyData = privateKeyBuf.toString("utf-8");
        publicKeyData = publicKeyBuf.toString("base64");
        appIdData = crypto
            .createHash("sha256")
            .update(publicKeyBuf)
            .digest("hex")
            .slice(0, 32)
            .split("")
            .map((c) => HEX_MAP.indexOf(c))
            .map((i) => CHAR_MAP[i])
            .join("");

        fs.writeFileSync(privateKeyFilePath, privateKeyData, { flag: "w" });
        fs.writeFileSync(publicKeyFilePath, publicKeyData, { flag: "w" });
        fs.writeFileSync(appIdFilePath, appIdData, { flag: "w" });
    } else {
        privateKeyData = fs.readFileSync(privateKeyFilePath).toString("utf-8");
        publicKeyData = fs.readFileSync(publicKeyFilePath).toString("utf-8");
        appIdData = fs.readFileSync(appIdFilePath).toString("utf-8");
    }

    return {
        appId: appIdData,
        private: privateKeyData,
        public: publicKeyData,
        appIdFilePath,
        privateKeyFilePath,
        publicKeyFilePath,
    };
}

function getEnvInfo(): EnvInfo {
    const isChrome = !!process.argv.find((arg) => arg === "chrome");
    const isFirefox = !!process.argv.find((arg) => arg === "firefox");
    const isDev = !!process.argv.find((arg) => arg === "dev");
    const watch = !!process.argv.find((arg) => arg === "--watch" || arg === "-w");

    if (!isChrome && !isFirefox) throw "No browser provided pls add `chrome` or `firefox`.";
    if (isChrome && isFirefox) throw "More than one browser provided, You can only bundle one at a time.";

    return {
        isChrome,
        isFirefox,
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

    return {
        name,
        out: path.resolve(dist, name),
        updateUrl: `http://127.0.0.1:5500/build/fmg-${envInfo.browser}.crx`,
        // updateUrl: `${homepage}/releases/download/v${envInfo.version}/fmg-${envInfo.browser}-v${envInfo.version}.crx`,
        keys: generateKeys(".keys"),
        ...envInfo,
        ...getPackageJsonInfo(),
    };
}
