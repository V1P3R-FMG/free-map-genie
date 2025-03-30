import channel from "@shared/channel/offscreen";
import Options from "options.json";

declare global {
    export interface OffscreenChannel {
        has(data: { key: string }): boolean;
        get(data: { key: string; dflt?: string }): string | null;
        set(data: { key: string; value: string }): void;
        remove(data: { key: string }): void;
        getBookmarks(): FMG.Extension.Bookmarks;
        setBookmarks(data: { bookmarks?: FMG.Extension.Bookmarks }): void;
        getSettings(): FMG.Extension.Settings;
        setSettings(data: { settings?: FMG.Extension.Settings }): void;
    }
}

function getDefaultSettings() {
    return Object.fromEntries(
        Options.map((option) => [option.name, option.value])
    ) as any as FMG.Extension.Settings;
}

function getBookmarks() {
    const data = localStorage.getItem("fmg:data:bookmarks");
    if (data == null) return [];
    return JSON.parse(data) as FMG.Extension.Bookmarks;
}

function getSettings() {
    const data = localStorage.getItem("fmg:data:settings");
    if (data == null) return getDefaultSettings();
    return JSON.parse(data) as FMG.Extension.Settings;
}

channel.onMessage("has", ({ key }) => {
    return localStorage.getItem(key) != null;
});

channel.onMessage("get", ({ key, dflt }) => {
    return localStorage.getItem(key) ?? dflt ?? null;
});

channel.onMessage("set", ({ key, value }) => {
    return localStorage.setItem(key, value);
});

channel.onMessage("remove", ({ key }) => {
    return localStorage.removeItem(key);
});

channel.onMessage("getBookmarks", () => {
    return getBookmarks();
});

channel.onMessage("setBookmarks", ({ bookmarks }) => {
    if (bookmarks == undefined || !bookmarks.length) {
        localStorage.removeItem("fmg:data:bookmarks");
    } else {
        localStorage.setItem("fmg:data:bookmarks", JSON.stringify(bookmarks));
    }
});

channel.onMessage("getSettings", () => {
    return getSettings();
});

channel.onMessage("setSettings", async ({ settings }) => {
    if (settings == undefined) {
        localStorage.removeItem("fmg:data:settings");
    } else {
        localStorage.setItem("fmg:data:settings", JSON.stringify(settings));
    }

    await channel.background.settingsChanged({ settings: (settings ?? getDefaultSettings()) });
});

channel.connect();
channel.background.settingsChanged({ settings: getSettings() });

logger.log("storage script loaded", window.location);