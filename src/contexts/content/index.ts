import runContexts from "@shared/run";
import { waitForPageType } from "@fmg/page";

import gamesChannel from "@content/channels/games.channel";

async function initScript() {
    const pageType = await waitForPageType();

    logger.log("PageType:", pageType);

    switch (pageType) {
        case "login": {
            const { default: script } = await import(
                /* webpackChunkName: "content/login.script" */ "./scripts/login.script"
            );
            await script.initScript();
            break;
        }
        case "map": {
            const { default: script } = await import(
                /* webpackChunkName: "content/map.script" */ "./scripts/map.script"
            );
            await script.initScript();
            break;
        }
        case "game-home": {
            const { default: script } = await import(
                /* webpackChunkName: "content/game-home.script" */ "./scripts/game-home.script"
            );
            await script.initScript();
            break;
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

    logger.log(await gamesChannel.getHeatmaps(1));
    logger.log(await gamesChannel.getAll());
    logger.log(await gamesChannel.getGame(1));
    logger.log(await gamesChannel.getMap(1));
}

runContexts("content", initScript, main);
