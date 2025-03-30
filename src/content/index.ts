import channel from "@shared/channel/content";

import { getPageType, type PageType } from "@fmg/page";
import { FMG_Map } from "./map";
import { FMG_Guide } from "./guide";
import { FMG_MapSelector } from "./map-selector";
import debounce from "@shared/debounce";

export interface State {
    attached: boolean;
    user: string;
    type: PageType
}

declare global {
    export interface ContentChannel {
        toastrError(data: { message: string }): void;
        getState(): State;
    }
}

channel.connect();

function listenForRefocus(callback: () => void) {
    document.addEventListener("visibilitychange", debounce(() => {
        switch (document.visibilityState) {
            case "visible":
                callback();
                logger.debug("refocused");
                break;
        }
    }, 250));
}

/**
 * Reload the page, but only if it has not been reloaded consecutively 3 times.
 */
function isReduxStoreDefined(): boolean {
    return !!window.store;
}

const state: State = {
    attached: false,
    user: "n/a",
    type: "unknown"
};

function setState(newState: Partial<State>) {
    Object.entries(newState).forEach(([k, v]) => {
        state[k as keyof typeof newState] = v as never;
    });
}

/**
 * Itialize the content script
 */
async function init() {
    // Run code for according to page type
    const type = await getPageType(window);
    logger.debug("pageType:", type);
    switch (type) {
        case "map":
            const map = new FMG_Map(window);
            await map.setup();
            listenForRefocus(() => map.reload());

            setState({
                attached: true,
                user: String(map.user),
                type
            });
            break;
        case "guide":
            const guide = new FMG_Guide(window);
            await guide.setup();
            listenForRefocus(() => guide.reload());

            setState({
                attached: true,
                user: String(guide.user),
                type
            });
            break;
        case "map-selector":
            await FMG_MapSelector.setup(window);

            setState({
                attached: true,
                type
            });
            break;
        case "home":
            state.attached = true;

            setState({
                attached: true,
                type
            });
            break;
        case "unknown":
            logger.warn(`Page type ${type}, not attaching content script`);
            break;
    }
}

channel.onMessage("toastrError", ({ message }) => {
    toastr.error(message);
});

channel.onMessage("getState", () => {
    return state;
});

init()
    .catch((err) => {
        window.postMessage({
            type: "fmg:error",
            error: err.message
        });
        logger.error("[CONTENT]", err);
    });