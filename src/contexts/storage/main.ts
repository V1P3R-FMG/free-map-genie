import { onMessage, type ChannelEventDef } from "@shared/channel/offscreen";
import { isIframeContext } from "@shared/context";
import runContexts from "@shared/run";

declare global {
    export interface Channels {
        offscreen: {
            has: ChannelEventDef<{ key: string }, boolean>;
            get: ChannelEventDef<{ key: string }, string | null>;
            set: ChannelEventDef<{ key: string; value: string }>;
            remove: ChannelEventDef<{ key: string }>;
            keys: ChannelEventDef<void, string[]>;
        };
    }
}

function isOffscreen() {
    const params = new URLSearchParams(window.location.search);
    return isIframeContext() || params.get("storage");
}

if (isOffscreen()) {
    onMessage("has", ({ key }) => {
        return window.localStorage.getItem(key) != null;
    });

    onMessage("get", ({ key }) => {
        return window.localStorage.getItem(key);
    });

    onMessage("set", ({ key, value }) => {
        window.localStorage.setItem(key, value);
    });

    onMessage("remove", ({ key }) => {
        window.localStorage.removeItem(key);
    });

    onMessage("keys", () => {
        return Object.keys(window.localStorage);
    });
}

setInterval(() => 1000);

runContexts("mapgenie storage", async () => isOffscreen());

logging.debug("hello world", localStorage);
