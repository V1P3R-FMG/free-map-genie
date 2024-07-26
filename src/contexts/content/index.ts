import runContexts from "@shared/run";
import { waitForPageType } from "@fmg/page";

import Games from "@fmg/api/games";

import ContentChannel from "./channel";

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
    await ContentChannel.set("hello", "world");
    const value = await ContentChannel.get("hello");
    logger.debug("hello =", value, "@ https://mapgenie.io");
    Games.getGame(1).then(logger.debug);
}

runContexts("content", initScript, main);
