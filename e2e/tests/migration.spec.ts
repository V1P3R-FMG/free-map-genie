import { expect } from "@playwright/test";

import { test } from "../helpers/fixtures";
import { MapPage } from "../pages/map";
import { extendStorageState } from "../helpers";

const VERSIONS = ["v1", "v2"] as const;
const DOMAINS = ["mapgenie.io", "rdr2map.com"] as const;

VERSIONS.forEach((version) => {
  DOMAINS.forEach((domain) => {
    test.describe(`Data migration from for ${domain}`, () => {
      test.use({
        storageState: async ({ storageState, storageData }, use) => {
          const extendedStorageState = await extendStorageState(
            storageState,
            storageData[version]
          );
          await use(extendedStorageState);
        },
      });

      test(`It should migrate @${version} data correctly`, async ({
        page,
        storageUserDataExpected,
      }) => {
        const mapPage = new MapPage(page);

        await mapPage.forceUserId(0);

        switch (domain) {
          case "mapgenie.io":
            await mapPage.gotoTarkovFactoryMap();
            break;
          case "rdr2map.com":
            await mapPage.gotoRedDeadRedemption2Map();
            break;
          default:
            throw new Error(`Unknown domain: ${domain}`);
        }

        await mapPage.waitForAxiosInterceptor();

        const userData = await mapPage.getUserData();

        const gameId = await mapPage.getGameId();
        const userId = await mapPage.getUserId();

        const { removedKeys, userData: expected } =
          storageUserDataExpected[version][`${gameId}:${userId}`] || {};

        // Sanity checks
        expect(userId).toEqual(0);
        expect(expected).toBeDefined();
        expect(removedKeys).toBeDefined();

        // Verify migrated data
        expect(userData.locations).toEqual(expected.locations);
        expect(userData.trackedCategoryIds).toEqual(
          expect.arrayContaining(expected.trackedCategoryIds)
        );
        expect(userData.notes).toEqual(expect.arrayContaining(expected.notes));
        expect(userData.presetOrdering).toEqual(expected.presetOrdering);
        expect(userData.presets).toEqual(
          expect.arrayContaining(expected.presets)
        );

        // Verify that old keys are removed

        const data = await page.evaluate((keys) => {
          return Object.fromEntries(
            keys.map((key) => [key, localStorage.getItem(key)])
          );
        }, removedKeys);

        for (const [key, value] of Object.entries(data)) {
          expect(
            value,
            `Expected localStorage key "${key}" to be removed`
          ).toBeNull();
        }
      });
    });
  });
});
