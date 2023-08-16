import { createScript } from "@shared/dom";
import { getData } from "@shared/extension";
import { initHandlers } from "./handlers";

const shared = {
    attached: false
};

function injectScript(src: string): HTMLScriptElement {
    const script = createScript({ src });
    document.head.appendChild(script);
    return script;
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
    injectScript(chrome.runtime.getURL("content.js"));
    initHandlers(shared);
}

init()
    .then(() => logger.log("extension script loaded"))
    .catch(console.error);
