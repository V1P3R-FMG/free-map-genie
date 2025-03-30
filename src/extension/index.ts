import channel from "@shared/channel/extension";
import { getPageType, PageType } from "@fmg/page";

declare global {
    export interface ExtensionChannel {
        hello(): string;
        getInfo(): { pageType: PageType, attached: boolean };
        addBookmark(): { url: string, favicon: string, title: string } | undefined;
        attached(): void;
    }
}

const shared = {
    attached: false
};

function injectScript(src: string): HTMLScriptElement {
    const head = document.head || document.documentElement;
    const script = document.createElement("script");
    script.src = src;
    head.appendChild(script);
    return script;
}

function injectLink(href: string): HTMLLinkElement {
    const head = document.head || document.documentElement;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    head.appendChild(link);
    return link;
}

channel.onMessage("hello", () => {
    return "Hello from the extension!";
});

channel.onMessage("getInfo", async () => {
    const pageType = await getPageType(window);
    return {
        pageType,
        attached: shared.attached
    };
});

channel.onMessage("attached", () => {
    shared.attached = true;
});

channel.onMessage("addBookmark", () => {
    const $url = document.head.querySelector(
        "meta[property='og:url']"
    ) as HTMLMetaElement;

    const $icon = document.head.querySelector(
        "link[rel='apple-touch-icon']"
    ) as HTMLLinkElement;

    const $title = document.head.querySelector(
        "meta[property='og:title']"
    ) as HTMLMetaElement;

    if (!$url || !$icon || !$title) {
        logger.warn("failed to add bookmark", {
            url: $url,
            icon: $icon,
            title: $title
        });
        return;
    }

    const url = $url.content;
    const favicon = $icon.href;
    const title = $title.content

    return { url, favicon, title };
});

async function init() {
    channel.connect();

    const settings = await channel.offscreen.getSettings();
    if (!settings.extension_enabled) {
        channel.disconnect();
        return;
    }

    injectLink(chrome.runtime.getURL("content.css"));
    injectScript(chrome.runtime.getURL("content.js"));
}

init()
    .then(() => logger.log("extension script loaded"))
    .catch(logger.error);
