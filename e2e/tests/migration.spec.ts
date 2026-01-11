import { expect } from "@playwright/test";

import { test } from "../fixtures";
import { MapPage } from "../pages/map";
import { resolveStorageState } from "../helpers";

test.beforeEach(async ({ page }) => {
  const mapPage = new MapPage(page);
  await mapPage.forceUserId(0);
});

["v1", "v2"].forEach((version) => {
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
      v1StorageUserDataExpected,
      v2StorageUserDataExpected,
    }) => {
      const versionsExpected = {
        v1: v1StorageUserDataExpected,
        v2: v2StorageUserDataExpected,
      };

      const mapPage = new MapPage(page);

      await mapPage.gotoTarkovFactoryMap({ timeout: 0, waitUntil: "commit" });
      await mapPage.waitForAxiosInterceptor();

      const userData = await mapPage.getUserData();

      const gameId = await mapPage.getGameId();
      const userId = await mapPage.getUserId();

      const expected = versionsExpected[version][`${gameId}:${userId}`];

      // Sanity checks
      expect(userId).toEqual(0);
      expect(expected).toBeDefined();

      // Verify migrated data
      expect(userData).toEqual(expected);
    });
  });
});
