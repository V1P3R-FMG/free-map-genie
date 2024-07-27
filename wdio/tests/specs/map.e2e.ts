import { expect } from "@wdio/globals";
import mapPage from "../pageobjects/map.page.js";

before(mapPage.init);

describe("content/map.js", async () => {
    it("pressing 'Mock User' button should mock an user correctly'", async () => {
        await mapPage.open(mapPage.ELDEN_RING_THE_LAND_BETWEEN_MAP_URL);

        await mapPage.loginWithMockedUser();

        await mapPage.userPanel.waitForExist({ timeout: 10000 });

        await expect(mapPage.getLoggedInUser()).resolves.toEqual(<MG.User>{
            id: -1,
            role: "user",
            hasPro: true,
            locations: [],
            trackedCategoryIds: [],
            presets: [],
            suggestions: [],
        });
    });
});
