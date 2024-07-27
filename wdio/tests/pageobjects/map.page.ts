// import { $ } from "@wdio/globals";
import Page from "./page.js";

/**
 * sub page containing specific selectors and methods for a specific page
 */
class MapPage extends Page {
    public readonly MAPGENIE_UR = "https://mapgenie.io/";
    public readonly ELDEN_RING_THE_LAND_BETWEEN_MAP_URL = this.MAPGENIE_UR + "elden-ring/maps/the-lands-between";
    public readonly FALLOUT_4_MAP_URL = "https://fallout4map.com/";

    /**
     * #fmg-mock-user-btn button
     */
    get mockUserButton() {
        return $("#fmg-mock-user-btn");
    }

    /**
     * #toggle-found button
     */
    get userPanel() {
        return $("#user-panel");
    }

    /**
     * Gets the current mapgenie user
     */
    async getLoggedInUser() {
        return browser.execute("return window.user");
    }

    /**
     * Login with a mocked user
     */
    async loginWithMockedUser() {
        await this.mockUserButton.click();
    }
}

export default new MapPage();
