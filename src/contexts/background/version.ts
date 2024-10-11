import CachedValue from "@shared/cached";

const fmgHomepagePathname = new URL(__HOMEPAGE__).pathname;
const fmgPackageJsonUrl = `https://raw.githubusercontent.com${fmgHomepagePathname}/main/package.json`;

const cachedPackagedJson = new CachedValue<{ version: string }>(fmgPackageJsonUrl, {
    maxAge: 15 * 60 * 1000,
});

export default async function fetchLatestVersion(): Promise<string> {
    const packagedJson = await cachedPackagedJson.data;
    return packagedJson.version;
}
