import runContexts from "@shared/run";

import Key from "./storage/key";

import storageService from "./services/storage.service";
import userService from "./services/user.service";
import { V3SettingsData } from "./storage/data/v3";
import { onMessage, sendMessage, type ChannelEventDef } from "@shared/channel/content";

declare global {
    export interface Channels {
        "content-script": {
            settings: ChannelEventDef<void, V3SettingsData>;
        };
    }
}

async function getScript(pageType: MG.PageType): Promise<PageScript | null> {
    switch (pageType) {
        case "login":
            return (
                await import(
                    /* webpackChunkName: "content/login.script" */
                    "./scripts/login.script"
                )
            ).default;
        case "map":
            return (
                await import(
                    /* webpackChunkName: "content/map.script" */
                    "./scripts/map.script"
                )
            ).default;
        case "game-home":
            return (
                await import(
                    /* webpackChunkName: "content/game-home.script" */
                    "./scripts/game-home.script"
                )
            ).default;
        default:
            return null;
    }
}

onMessage("settings", async () => {
    if (await userService.isLoggedIn()) {
        const data = await storageService.load(Key.current);
        return data.settings;
    } else {
        return {};
    }
});

async function main() {
    const pageType = await sendMessage("background", "get:page:type", { url: window.location.href });

    logging.log("PageType:", pageType);

    const script = await getScript(pageType);
    script?.initScript();
}

runContexts("content", main);
