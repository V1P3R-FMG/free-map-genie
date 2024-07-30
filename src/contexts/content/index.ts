import runContexts from "@shared/run";
import { waitForPageType } from "@fmg/page";

import StorageChannel from "@content/channels/storage.channel";
import GamesChannel from "@content/channels/games.channel";

async function initScript() {
    const pageType = await waitForPageType();

    logger.log("PageType:", pageType);

    switch (pageType) {
        case "login": {
            const { default: script } = await import(
                /* webpackChunkName: "content/login.script" */ "./scripts/login.script"
            );
            await script.initScript();
        }
        case "map": {
            const { default: script } = await import(
                /* webpackChunkName: "content/map.script" */ "./scripts/map.script"
            );
            await script.initScript();
        }
        default:
            return;
    }
}

async function main() {
    // await StorageChannel.set("hello", "world");
    // const value = await StorageChannel.get("hello");
    // logger.debug("hello =", value, "@ https://mapgenie.io");
    // const game = await GamesChannel.getGame(1);
    // logger.debug("game:1 =", game?.title);

    logger.log(await GamesChannel.getAll());
    logger.log(await GamesChannel.getGame(1));
    logger.log(await GamesChannel.getMap(1));
}

runContexts("content", initScript, main);
