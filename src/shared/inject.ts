import { waitForHead } from "@utils/dom";

export function injectScript(src: string, query?: Record<string, string>) {
    const url = new URL(src);
    if (query) {
        Object.entries(query).forEach(([key, value]) => url.searchParams.set(key, value));
    }
    return new Promise(async (resolve) => {
        const script = document.createElement("script");
        script.src = url.toString();
        script.onload = resolve;
        script.onerror = resolve;

        const head = await waitForHead(document);
        head.appendChild(script);
    });
}

export function injectExtensionScript(path: string, query?: Record<string, string>) {
    return injectScript(chrome.runtime.getURL(path), query);
}

export function injectStyle(href: string) {
    return new Promise<void>(async (resolve) => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.type = "text/css";
        link.href = href;
        const head = await waitForHead(document);
        head.appendChild(link);
        resolve();
    });
}
