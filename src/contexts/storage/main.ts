import channel from "@shared/channel/offscreen";
import { isIframeContext } from "@shared/context";
import runContexts from "@shared/run";

declare global {
    export interface Channels {
        offscreen: {
            has(data: { key: string }): boolean;
            get(data: { key: string; dflt?: string }): string | null;
            set(data: { key: string; value: string }): void;
            remove(data: { key: string }): void;
            keys(): string[];
            ping(): "pong";
            title(data: { url: string }): string;
        };
    }
}

const params = new URLSearchParams(window.location.search);
const isOffscreen = isIframeContext() && params.get("storage");

channel.onMessage("has", ({ key }) => {
    return window.localStorage.getItem(key) != null;
});

channel.onMessage("get", ({ key, dflt }) => {
    return window.localStorage.getItem(key) ?? dflt ?? null;
});

channel.onMessage("set", ({ key, value }) => {
    window.localStorage.setItem(key, value);
});

channel.onMessage("remove", ({ key }) => {
    window.localStorage.removeItem(key);
});

channel.onMessage("keys", () => {
    return Object.keys(window.localStorage);
});

channel.onMessage("ping", () => {
    return "pong" as const;
});

channel.onMessage("title", async ({ url }) => {
    const parser = new DOMParser();
    const res = await fetch(url);
    const text = await res.text();
    const doc = parser.parseFromString(text, "text/html");
    return doc.title;
});

runContexts("mapgenie storage", async () => {
    if (isOffscreen) {
        channel.connect();
    }
    return isOffscreen;
});
