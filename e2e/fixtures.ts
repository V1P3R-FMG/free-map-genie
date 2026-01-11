import path from "node:path";
import fs from "node:fs";
import { test as base, type BrowserContext } from "@playwright/test";

import { launchChromium, launchFirefox, loadStorageState } from "./helpers";
import { findFreeTcpPort, getFirefoxContextInfo } from "./helpers/firefox";
import { getCredentials, login } from "./helpers/auth";

import type { UserData } from "@src/common/storage";

export interface LocalStorageEntry {
  name: string;
  value: string;
}

export interface ExtensionFixtures {
  context: BrowserContext;
  extensionId: string;
  extensionPath: string;
  extensionBaseUrl: string;
  firefoxDebugPort: number | null;
  v1StorageData: LocalStorageEntry[];
  v2StorageData: LocalStorageEntry[];
  v1StorageUserDataExpected: Record<string, UserData>;
  v2StorageUserDataExpected: Record<string, UserData>;
}

const readData = async <T>(filename: string) => {
  const data = await fs.promises.readFile(
    new URL(path.join("data", filename), import.meta.url),
    "utf-8"
  );
  return JSON.parse(data) as T;
};

const toLocalStorageFormat = (data: Record<string, any>) => {
  return Object.entries(data).map(([name, value]) => ({
    name,
    value: JSON.stringify(value),
  }));
};

export const test = base.extend<ExtensionFixtures>({
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
    const data = await readData<Record<string, any>>("storage.v1.json");
    await use(toLocalStorageFormat(data));
  },
  v2StorageData: async ({}, use) => {
    const data = await readData<Record<string, any>>("storage.v2.json");
    await use(toLocalStorageFormat(data));
  },
  v1StorageUserDataExpected: async ({}, use) => {
    const data = await readData<Record<string, UserData>>(
      "userData.v1.expected.json"
    );
    await use(data);
  },
  v2StorageUserDataExpected: async ({}, use) => {
    const data = await readData<Record<string, UserData>>(
      "userData.v2.expected.json"
    );
    await use(data);
  },
});

export const expect = test.expect;
