import { createScript } from "@shared/dom";
import { initHandlers } from "./handlers";

const shared = {
    attached: false
};

function injectScript(name: string): HTMLScriptElement {
    const script = createScript({
        src: chrome.runtime.getURL(name)
    });
    script.onload = () => (shared.attached = true);
    document.body.appendChild(script);
    return script;
}

injectScript("content.js");
initHandlers(shared);

logger.log("extension script loaded");
