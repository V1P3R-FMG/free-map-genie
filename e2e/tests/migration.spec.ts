import { expect } from "@playwright/test";

import { test } from "../fixtures";
import { MapPage } from "../pages/map";
import { resolveStorageState } from "../helpers";

import type { Page } from "@playwright/test";

(["v1", "v2"] as const).forEach((version) => {
  test.describe(`Data migration from fmg@${version}`, () => {
    test.use({
      storageState: async (
        { storageState, v1StorageData, v2StorageData },
        use
      ) => {
        const { cookies } = await resolveStorageState(storageState);

        const versions = {
          v1: v1StorageData,
          v2: v2StorageData,
        };

        await use({
          cookies,
          origins: [
            {
              origin: "https://mapgenie.io",
              localStorage: versions[version] ?? [],
            },
          ],
        });
      },
    });

    test("It should migrate data correctly", async ({
      page,
      storageData,
      storageUserDataExpected,
    }) => {
      const mapPage = new MapPage(page);

      await mapPage.forceUserId(0);

      await mapPage.gotoTarkovFactoryMap({ timeout: 0 });
      await mapPage.waitForAxiosInterceptor();

      const userData = await mapPage.getUserData();

      const gameId = await mapPage.getGameId();
      const userId = await mapPage.getUserId();

      const expected = storageUserDataExpected[version][`${gameId}:${userId}`];

      // Sanity checks
      expect(userId).toEqual(0);
      expect(expected).toBeDefined();

      // Verify migrated data
      expect(userData).toEqual(expected);

      // Verify that old keys are removed
      const keys = storageData[version].map((item) => item.name);

      const data = await page.evaluate((keys) => {
        return Object.fromEntries(
          keys.map((key) => [key, localStorage.getItem(key)])
        );
      }, keys);

      for (const key of keys) {
        expect(data[key]).toBeNull();
      }
    });
  });
});
