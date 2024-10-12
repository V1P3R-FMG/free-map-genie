import { onMessage, disconnect, type ChannelEventDef } from "@shared/channel/offscreen";
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
            ping: ChannelEventDef<void, "pong">;
        };
    }
}

const params = new URLSearchParams(window.location.search);
const isOffscreen = isIframeContext() && params.get("storage");

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

onMessage("ping", () => {
    return "pong" as const;
});

runContexts("mapgenie storage", async () => {
    if (!isOffscreen) {
        disconnect();
        return false;
    }
});
