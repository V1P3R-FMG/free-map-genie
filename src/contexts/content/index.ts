import runContexts from "@shared/run";
import { MapgeniePageType, waitForPageType } from "@utils/fmg-page";
import Channel, { ResponseType } from "@shared/channel";
import { Channels } from "@constants";
import * as s from "shared/schema";

import Key from "./storage/key";

// import gamesChannel from "@content/channels/games.channel";

import storageService from "./services/storage.service";
import userService from "./services/user.service";
import { V3SettingsData } from "./storage/data/v3";

const messageScheme = s.union([
    s.object({
        type: s.union([s.literal("settings"), s.literal("map"), s.literal("game")]),
        data: s.literal(undefined),
    }),
]);

export type MessageScheme = s.Type<typeof messageScheme>;

async function getScript(pageType: MapgeniePageType): Promise<PageScript | null> {
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

async function initScript() {
    const pageType = await waitForPageType();

    logging.log("PageType:", pageType);

    const script = await getScript(pageType);
    script?.initScript();
}

async function fetchSettings(cb: (data: V3SettingsData) => void) {
    if (await userService.isLoggedIn()) {
        const data = await storageService.load(Key.current);
        cb(data.settings);
    } else {
        cb({});
    }
}

async function main() {
    // await StorageChannel.set("hello", "world");
    // const value = await StorageChannel.get("hello");
    // logging.debug("hello =", value, "@ https://mapgenie.io");
    // const game = await gamesChannel.getGame(20);
    // logging.debug("game:20 =", game);

    Channel.window(Channels.Content, (e, sendResponse) => {
        const message = messageScheme.parse(e);
        const { type } = message;

        switch (type) {
            case "settings":
                fetchSettings(sendResponse);
                return ResponseType.Handled;
            case "map":
                sendResponse(window.mapData?.map);
                return ResponseType.Handled;
            case "game":
                sendResponse(window.game);
            default:
                return ResponseType.NotHandled;
        }
    });
}

runContexts("content", initScript, main);
