import { browser } from "@wdio/globals";

/**
 * main page object containing all methods, selectors and functionality
 * that is shared across all page objects
 */
export default class Page {
    public readonly MAPGENIE_URL = "https://mapgenie.io/" as const;

    /**
     * Init browser
     */
    async init() {
        await browser.maximizeWindow();
    }

    /**
     * Opens a sub page of the page
     * @param url to open
     */
    async open(url: string) {
        await browser.url(url);
    }

    /**
     * Opens a game home page
     * @param game slug of the game name
     */
    openGame(game: string) {
        return this.open(this.MAPGENIE_URL + game);
    }

    /**
     * Opens a map page
     * @param game slug of the game name
     * @param map slug of the map name
     */
    openMap(game: string, map: string) {
        return this.open(this.MAPGENIE_URL + `${game}/maps/${map}`);
    }
}
