import { getScript } from "./observer";
import { handleRequest } from "./handlers";
import { getSettings } from "../shared/settings";

function removeScript(script: HTMLScriptElement|null): { script?: HTMLScriptElement, parent?: HTMLElement } {
    const parent = script?.parentNode;

    if (script) script.remove();

    return { script: script as HTMLScriptElement, parent: parent as HTMLElement };
}

function appendScript({ script, parent }: { script?: HTMLScriptElement, parent?: HTMLElement }) {
    if (script && parent) {
        return new Promise((resolve, reject) => {
            parent.append(script);

            if (script.innerText.length == 0) {
                script.onload = resolve;
                script.onerror = reject;
            } else {
                resolve(void 0);
            }
        })   
    }
}

//Find data and map script and unparent them from the dom
const p_dataScript = Promise.race([
	getScript({ startsWith: "window.mapUrls" }),
	getScript({ startsWith: "window.mapUrl" })
]).then(removeScript);

const p_scripts = Promise.all([
    getScript({ src: "map.js" }),
    getScript({ match: "let baseUrl = document.head.querySelector" }),
    getScript({ match: "state.foundLocationsByCategory = window.foundLocationsByCategory;" }),
].map(p => p.then(removeScript)));

getSettings().then((settings) => {
    return Promise.resolve()
		.then(() => {
			if (!settings.extension_enabled) return;

			window.sessionStorage.setItem("fmg:extension:settings", JSON.stringify(settings));
			window.sessionStorage.setItem("fmg:debug_mode", JSON.stringify(!!chrome.runtime.getManifest().version_name?.match("-debug$")));

			return Promise.resolve()
				.then(() => p_dataScript.then(appendScript))
				.then(() => {
					return new Promise((resolve, reject) => {
						let script = document.createElement("script");
						script.src = chrome.runtime.getURL("page.js");
						script.onload = resolve;
						script.onerror = reject;
						(document.head||document).append(script);
					})
				})
				.then(() => p_scripts.then(scripts => scripts.forEach(appendScript)))
		})
        .catch(console.error)
        .finally(() => {
            // if anything wrong happend make sure we append back the scripts
            p_dataScript.then(appendScript);
			p_scripts.then(scripts => scripts.forEach(appendScript));
        });        
});

//Handle requests from popup
chrome.runtime.onMessage.addListener(handleRequest);