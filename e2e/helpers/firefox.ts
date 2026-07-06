import path from "node:path";
import fs from "node:fs/promises";
import { connectWithMaxRetries } from "playwright-webextext/dist/firefox_remote.js";

import type { BrowserContext } from "@playwright/test";
import type { UserManifest } from "wxt";

export { findFreeTcpPort } from "playwright-webextext/dist/firefox_remote.js";

const firefoxExtensionContexts = new WeakMap<
  BrowserContext,
  FirefoxExtensionInfo
>();

export interface FirefoxExtensionInfo {
  baseUrl: string;
  extensionId: string;
}

interface FirefoxAddon {
  id: string;
  manifestURL?: string;
}

export const resolveFirefoxExtensionInfo = async (
  extensionPath: string,
  debuggingPort: number
): Promise<FirefoxExtensionInfo> => {
  const manifestPath = path.join(extensionPath, "manifest.json");
  const manifest: UserManifest = JSON.parse(
    await fs.readFile(manifestPath, "utf8")
  );

  const extensionName = manifest.name;

  const geckoId = manifest?.browser_specific_settings?.gecko?.id;

  if (!geckoId) {
    throw new Error(
      `Manifest for "${extensionName}" is missing "browser_specific_settings.gecko.id"`
    );
  }

  const remote = await connectWithMaxRetries({ port: debuggingPort });
  try {
    const response = await remote.client.request("listAddons");

    const addons: FirefoxAddon[] = response.addons;

    const targetAddon = addons.find((addon) => addon.id === geckoId);

    const manifestUrl = targetAddon?.manifestURL;
    if (!manifestUrl) {
      throw new Error(
        `Could not determine manifest URL for "${extensionName}"`
      );
    }

    const baseUrl = manifestUrl.replace(/\/manifest\.json(?:\?.*)?$/, "");
    const extensionId = baseUrl.replace(/^moz-extension:\/\//, "") + "/";

    return {
      baseUrl,
      extensionId,
    };
  } finally {
    remote.disconnect();
  }
};

export const setFirefoxExtensionInfo = (
  context: BrowserContext,
  info: FirefoxExtensionInfo
) => {
  firefoxExtensionContexts.set(context, { ...info });
};

export const getFirefoxContextInfo = (
  context: BrowserContext
): FirefoxExtensionInfo | undefined => {
  return firefoxExtensionContexts.get(context);
};
