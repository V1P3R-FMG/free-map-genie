import { allowWindowMessaging } from "webext-bridge/content-script";

import { getData } from "@shared/extension";
import { initHandlers } from "./handlers";

allowWindowMessaging("fmg");

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

async function init() {
    const data = await getData();
    if (!data.settings.extension_enabled) return;

    window.addEventListener("message", async (message) => {
        if (typeof message.data !== "object") return;

        const { type } = message.data;

        switch (type) {
            case "fmg:attached":
                shared.attached = true;
                break;
        }
    });

    window.sessionStorage.setItem("fmg:extension:data", JSON.stringify(data));

    injectLink(chrome.runtime.getURL("content.css"));
    injectScript(chrome.runtime.getURL("content.js"));
    
    initHandlers(shared);
}

init()
    .then(() => logger.log("extension script loaded"))
    .catch(logger.error);
