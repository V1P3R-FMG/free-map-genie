import { sleep, waitForCallback } from "./async";

export async function getElement<T extends Element>(
    selector: string,
    win?: Window
): Promise<T> {
    win = win ?? window;
    let element = win.document.querySelector(selector);
    if (element !== null) return element as T;
    while (element === null) {
        await sleep(100);
        element = win.document.querySelector(selector);
    }
    return element as T;
}

export async function getElementWithXPath<T extends Element>(
    xpath: string,
    win?: Window
): Promise<T> {
    win = win ?? window;
    let element = win.document.evaluate(xpath, win.document).iterateNext();
    if (element !== null) return element as T;
    while (element === null) {
        await sleep(100);
        element = win.document.evaluate(xpath, win.document).iterateNext();
    }
    return element as T;
}

export interface CreateScriptOptions {
    src?: string;
    content?: string;
    id?: string;
    appendTo?: HTMLElement;
}

export function createScript(options: CreateScriptOptions): HTMLScriptElement {
    if (options.src && options.content) {
        throw new Error("Cannot create script with both src and content");
    }

    const script = document.createElement("script");

    if (options.src) {
        script.src = options.src;
    } else if (options.content) {
        script.textContent = options.content;
    }

    if (options.appendTo) {
        options.appendTo.appendChild(script);
    }

    return script;
}
