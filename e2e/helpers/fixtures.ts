import path from "node:path";
import fs from "node:fs";
import {
  test as base,
  StorageState,
  type BrowserContext,
} from "@playwright/test";
import { fullLists, PlaywrightBlocker } from "@ghostery/adblocker-playwright";
import { CacheRoute } from "playwright-network-cache";

import { launchChromium, launchFirefox, loadStorageState } from ".";
import { findFreeTcpPort, getFirefoxContextInfo } from "./firefox";
import { getCredentials, login } from "./auth";

import type { UserData } from "@src/common/storage";

interface ExpectedUserData {
  removedKeys: string[];
  userData: UserData;
}

export type Version = "v1" | "v2";

export interface ExtensionFixtures {
  blocker: PlaywrightBlocker;
  context: BrowserContext;
  extensionId: string;
  extensionPath: string;
  extensionBaseUrl: string;
  firefoxDebugPort: number | null;
  v1StorageData: Exclude<StorageState, string>;
  v2StorageData: Exclude<StorageState, string>;
  storageData: Record<Version, Exclude<StorageState, string>>;
  v1StorageUserDataExpected: Record<string, ExpectedUserData>;
  v2StorageUserDataExpected: Record<string, ExpectedUserData>;
  storageUserDataExpected: Record<Version, Record<string, ExpectedUserData>>;
}

const readData = async <T>(filename: string) => {
  const data = await fs.promises.readFile(
    new URL(path.join("../data", filename), import.meta.url),
    "utf-8"
  );
  return JSON.parse(data) as T;
};

export const test = base.extend<ExtensionFixtures>({
  blocker: async ({}, use) => {
    const blocker = await PlaywrightBlocker.fromLists(fetch, fullLists, {
      enableCompression: true,
    });
    await use(blocker);
  },
  firefoxDebugPort: [
    async ({ browserName }, use) => {
      if (browserName !== "firefox") {
        return use(null);
      }
      const port = await findFreeTcpPort();
      await use(port);
    },
    { auto: true },
  ],
  extensionPath: [
    async ({ browserName }, use) => {
      const extensionPath =
        browserName === "firefox"
          ? path.resolve(".output/firefox-mv3")
          : path.resolve(".output/chrome-mv3");
      await use(extensionPath);
    },
    { option: true },
  ],
  page: async ({ blocker, page }, use) => {
    await blocker.enableBlockingInPage(page);

    const cacheRoute = new CacheRoute(page, {
      baseDir: path.resolve("playwright/.cache/network"),
      ttlMinutes: 60 * 24,
      match: (req) => !req.url().match(/^(chrome|moz)-extension:/),
    });

    await cacheRoute.GET("**/*.{png,jpg,jpeg,webp,gif}*");
    await cacheRoute.GET("**/*.{css,js,json}*");
    await cacheRoute.GET("**/*.{woff2,woff,tff}*");
    await cacheRoute.GET("https://mapgenie.io/**");
    await cacheRoute.GET("https://rdr2map.com/**");

    await use(page);
  },
  storageState: async ({ storageState, browser }, use, testInfo) => {
    if (testInfo.tags.includes("@no-auth")) return use(storageState);

    const credentials = getCredentials();
    const cookies = await login(browser, credentials);

    await use({
      cookies,
      origins: [],
    });
  },
  context: async (
    { browserName, extensionPath, firefoxDebugPort, headless, storageState },
    use
  ) => {
    const [context, userDataDir] =
      browserName === "firefox"
        ? await launchFirefox({
            headless,
            extensionPath,
            firefoxDebugPort,
          })
        : await launchChromium({
            headless,
            extensionPath,
          });

    await loadStorageState(context, storageState);

    try {
      await use(context);
    } finally {
      await context.close();
      if (userDataDir) {
        await fs.promises.rm(userDataDir, {
          recursive: true,
          force: true,
        });
      }
    }
  },
  extensionId: async ({ browserName, context }, use) => {
    if (browserName === "firefox") {
      const { extensionId } = getFirefoxContextInfo(context);
      await use(extensionId);
      return;
    } else {
      let [background] = context.serviceWorkers();
      if (!background) background = await context.waitForEvent("serviceworker");

      const extensionId = background.url().split("/")[2];
      await use(extensionId);
    }
  },
  extensionBaseUrl: async ({ browserName, context }, use) => {
    if (browserName === "firefox") {
      const { baseUrl } = getFirefoxContextInfo(context);
      await use(baseUrl);
      return;
    } else {
      let [background] = context.serviceWorkers();
      if (!background) background = await context.waitForEvent("serviceworker");
      const baseUrl = await background.evaluate<string>(
        "chrome.runtime.getURL('/')"
      );
      await use(baseUrl);
    }
  },
  v1StorageData: async ({}, use) => {
    const data = await readData<Exclude<StorageState, string>>(
      "storage.v1.json"
    );
    await use(data);
  },
  v2StorageData: async ({}, use) => {
    const data = await readData<Exclude<StorageState, string>>(
      "storage.v2.json"
    );
    await use(data);
  },
  storageData: async ({ v1StorageData, v2StorageData }, use) => {
    await use({
      v1: v1StorageData,
      v2: v2StorageData,
    });
  },
  v1StorageUserDataExpected: async ({}, use) => {
    const data = await readData<Record<string, ExpectedUserData>>(
      "userData.v1.expected.json"
    );
    await use(data);
  },
  v2StorageUserDataExpected: async ({}, use) => {
    const data = await readData<Record<string, ExpectedUserData>>(
      "userData.v2.expected.json"
    );
    await use(data);
  },
  storageUserDataExpected: async (
    { v1StorageUserDataExpected, v2StorageUserDataExpected },
    use
  ) => {
    await use({
      v1: v1StorageUserDataExpected,
      v2: v2StorageUserDataExpected,
    });
  },
});

export const expect = test.expect;
