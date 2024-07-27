import { $ } from "@wdio/globals";
import Page from "./page.js";

/**
 * sub page containing specific selectors and methods for a specific page
 */
class MapPage extends Page {
    public readonly ELDEN_RING_THE_LAND_BETWEEN_MAP_URL =
        `${this.MAPGENIE_URL}elden-ring/maps/the-lands-between` as const;
    public readonly FALLOUT_4_MAP_URL = "https://fallout4map.com/" as const;

    get mockUserButton() {
        return $("#fmg-mock-user-btn");
    }

    get userPanel() {
        return $("#user-panel");
    }

    async getLoggedInUser() {
        return browser.execute("return window.user");
    }

    async loginWithMockedUser() {
        await this.mockUserButton.waitForExist({ timeout: 10000 });
        await this.mockUserButton.click();
    }
}

export default new MapPage();
