import { browser } from "@wdio/globals";

export default class Page {
    public readonly MAPGENIE_URL = "https://mapgenie.io/" as const;

    async init() {
        await browser.maximizeWindow();

        if (process.env.THROTTLE) {
            console.log(process.env.THROTTLE);
            await browser.throttleCPU(Number(process.env.THROTTLE));
        }
    }

    async open(url: string) {
        await browser.url(url);
    }

    openGame(game: string) {
        return this.open(this.MAPGENIE_URL + game);
    }

    openMap(game: string, map: string) {
        return this.open(this.MAPGENIE_URL + `${game}/maps/${map}`);
    }
}
