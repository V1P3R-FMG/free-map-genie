import { browser } from "@wdio/globals";

/**
 * main page object containing all methods, selectors and functionality
 * that is shared across all page objects
 */
export default class Page {
    /**
     * Opens a sub page of the page
     * @param path path of the sub page (e.g. /path/to/page.html)
     */
    async open(url: string) {
        await browser.url(url);
        await browser.maximizeWindow();
    }

    /**
     * Opens a game home page
     * @param game slug of the game name
     */
    openGame(game: string) {
        return this.open(game);
    }

    /**
     * Opens a map page
     * @param game slug of the game name
     * @param map slug of the map name
     */
    openMap(game: string, map: string) {
        return this.open(`${game}/maps/${map}`);
    }
}
