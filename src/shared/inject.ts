import { waitForHead } from "@utils/dom";

export interface InjectOptions {
    query?: {
        [name: string]: string;
    };
    document?: Document;
}

export function injectScript(src: string, { query, document }: InjectOptions = {}) {
    const url = new URL(src);

    document ??= global.document;

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

export function injectExtensionScript(path: string, injectOptions: InjectOptions = {}) {
    return injectScript(chrome.runtime.getURL(path), injectOptions);
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
