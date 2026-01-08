import { test as base, type BrowserContext } from "@playwright/test";
import { withExtension } from "playwright-webextext";
import {
  findFreeTcpPort,
  getFirefoxContextInfo,
  resolveFirefoxExtensionInfo,
  setFirefoxExtensionInfo,
} from "./helpers";

import path from "node:path";
import os from "node:os";
import fs from "node:fs/promises";

interface ExtensionFixtures {
  context: BrowserContext;
  extensionId: string;
  extensionPath: string;
  extensionBaseUrl: string;
  firefoxDebugPort: number | null;
}

export const test = base.extend<ExtensionFixtures>({
  firefoxDebugPort: [
    async ({ browserName }, use) => {
      if (browserName !== "firefox") {
        await use(null);
        return;
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
  context: async (
    { playwright, browserName, extensionPath, firefoxDebugPort, headless },
    use
  ) => {
    const browserType = withExtension(playwright[browserName], extensionPath);

    if (browserName === "chromium") {
      const context = await browserType.launchPersistentContext("", {
        headless,
        channel: "chromium",
      });
      try {
        await use(context);
      } finally {
        await context.close();
      }
    } else {
      if (!firefoxDebugPort) {
        throw new Error("Firefox debugging port not initialized");
      }

      const userDataDir = await fs.mkdtemp(path.join(os.tmpdir(), "fmg-"));

      const context = await browserType.launchPersistentContext(userDataDir, {
        headless,
        args: ["--start-debugger-server", String(firefoxDebugPort)],
        firefoxUserPrefs: {
          "xpinstall.signatures.required": false,
          "extensions.installDistroAddons": false,
          "extensions.manifestV3.enabled": true,
        },
      });

      const info = await resolveFirefoxExtensionInfo(
        extensionPath,
        firefoxDebugPort
      );
      setFirefoxExtensionInfo(context, info);

      try {
        await use(context);
      } finally {
        await context.close();
        await fs.rm(userDataDir, {
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
});
export const expect = test.expect;
