import { getData } from "@shared/extension";
import { initHandlers } from "./handlers";

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
    window.addEventListener("message", (event) => {
        switch (event.data.type) {
            case "fmg:attached":
                shared.attached = true;
                break;
        }
    });
    window.sessionStorage.setItem(
        "fmg:extension:data",
        JSON.stringify(await getData())
    );
    injectLink(chrome.runtime.getURL("content.css"));
    injectScript(chrome.runtime.getURL("content.js"));
    initHandlers(shared);
}

init()
    .then(() => logger.log("extension script loaded"))
    .catch(logger.error);
