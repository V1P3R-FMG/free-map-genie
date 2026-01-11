import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  BrowserContext,
  chromium,
  firefox,
  StorageState,
} from "@playwright/test";
import { withExtension } from "playwright-webextext";

import {
  setFirefoxExtensionInfo,
  resolveFirefoxExtensionInfo,
} from "./firefox";

const EXTENSION_PROTOCOLS = ["chrome-extension://", "moz-extension://"];

export interface LaunchOptions {
  headless: boolean;
  extensionPath: string;
  firefoxDebugPort?: number | null;
}

export const wait = async (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const isExtensionUrl = (url: string) => {
  return EXTENSION_PROTOCOLS.some((protocol) => url.startsWith(protocol));
};

export const launchChromium = async ({ headless }: LaunchOptions) => {
  const browserType = withExtension(chromium, "");

  const context = await browserType.launchPersistentContext("", {
    headless,
    channel: "chromium",
  });

  return [context, ""] as const;
};

export const launchFirefox = async ({
  headless,
  firefoxDebugPort,
  extensionPath,
}: LaunchOptions) => {
  if (!firefoxDebugPort) {
    throw new Error("Firefox debugging port not initialized");
  }

  const browserType = withExtension(firefox, extensionPath);

  const userDataDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "fmg-"));

  const context = await browserType.launchPersistentContext(userDataDir, {
    headless,
    args: ["--start-debugger-server", String(firefoxDebugPort)],
  });

  const info = await resolveFirefoxExtensionInfo(
    extensionPath,
    firefoxDebugPort
  );
  setFirefoxExtensionInfo(context, info);

  return [context, userDataDir] as const;
};

export const resolveStorageState = async (storageState: StorageState) => {
  if (typeof storageState === "string") {
    const data = await fs.promises.readFile(storageState, "utf-8");
    return JSON.parse(data) as Exclude<StorageState, string>;
  } else {
    return storageState as Exclude<StorageState, string>;
  }
};

export const loadStorageState = async (
  context: BrowserContext,
  storageState: StorageState
) => {
  const resolvedState = await resolveStorageState(storageState);

  if (resolvedState) {
    await context.addCookies(resolvedState.cookies);
  }

  if (resolvedState.origins) {
    await context.addInitScript((origins) => {
      const { localStorage } =
        origins.find((origin) => origin.origin === window.location.origin) ||
        {};
      if (localStorage) {
        localStorage.forEach(({ name, value }) => {
          window.localStorage.setItem(name, value);
        });
      }
    }, resolvedState.origins);
  }
};
