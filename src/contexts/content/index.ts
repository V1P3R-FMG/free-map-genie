import runContexts from "@shared/run";
import { waitForPageType } from "@fmg/page";

import StorageChannel from "@content/channels/storage";
import GamesChannel from "@content/channels/games";

export interface PageScript {
    initScript(): Promise<void> | void;
}

async function initScript() {
    const pageType = await waitForPageType();
    logger.log("PageType:", pageType);

    switch (pageType) {
        case "login": {
            const { default: script } = await import(/* webpackChunkName: "content/login" */ "./login/index");
            await script.initScript();
        }
        case "map": {
            const { default: script } = await import(/* webpackChunkName: "content/map" */ "./map/index");
            await script.initScript();
        }
        default:
            return;
    }
}

async function main() {
    await StorageChannel.set("hello", "world");
    const value = await StorageChannel.get("hello");
    logger.debug("hello =", value, "@ https://mapgenie.io");

    const game = await GamesChannel.getGame(1);
    logger.debug("game:1 =", game?.title);
}

runContexts("content", initScript, main);
