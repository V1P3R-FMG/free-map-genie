import runContexts from "@shared/run";
import { waitForPageType } from "@fmg/page";

import Games from "@fmg/api/games";

import LoginScript from "./login/index";
import MapScript from "./map/index";

export interface PageScript {
    initScript(): Promise<void> | void;
}

async function initScript() {
    const pageType = await waitForPageType();
    logger.log("PageType:", pageType);

    switch (pageType) {
        case "login":
            await LoginScript.initScript();
        case "map":
            await MapScript.initScript();
        default:
            return;
    }
}

async function main() {
    Games.getGame(1).then(logger.debug);
}

runContexts("content", initScript, main);
