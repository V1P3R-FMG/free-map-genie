import { createScript } from "@shared/dom";

function injectScript(name: string): HTMLScriptElement {
    const script = createScript({
        src: chrome.runtime.getURL(name)
    });
    document.body.appendChild(script);
    return script;
}

injectScript("content.js");

console.log("[FMG] extension script loaded");
