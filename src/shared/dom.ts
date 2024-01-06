import { sleep, timeout, waitForCallback } from "./async";

export function getElement<T extends Element>(
    selector: string,
    winOrElement?: Window | Element,
    timeoutTime: number = -1
): Promise<T> {
    return timeout((async () => {
        const parent = winOrElement instanceof Window ? winOrElement.document : winOrElement ?? window.document;
        let element = parent.querySelector(selector);
        if (element !== null) return element as T;
        while (element === null) {
            await sleep(100);
            element = parent.querySelector(selector);
        }
        return element as T;
    })(), timeoutTime, `Failed to get element ${selector}.`);
}

export function getElementWithXPath<T extends Element>(
    xpath: string,
    win?: Window,
    timeoutTime: number = -1
): Promise<T> {
    return timeout((async () => {
        win = win ?? window;
        let element = win.document.evaluate(xpath, win.document).iterateNext();
        if (element !== null) return element as T;
        while (element === null) {
            await sleep(100);
            element = win.document.evaluate(xpath, win.document).iterateNext();
        }
        return element as T;
    })(), timeoutTime, `Failed to get element ${xpath}.`);
}

export interface CreateScriptOptions {
    src?: string;
    content?: string;
    id?: string;
    appendTo?: HTMLElement;
}

export function documentLoaded(win?: Window): Promise<void> {
    return waitForCallback(() => (win ?? window).document.readyState === "complete");
}

export async function waitForBody(win: Window): Promise<void> {
    await waitForCallback(() => !!(win ?? window).document.body);
}

export async function waitForHead(win: Window): Promise<void> {
    await waitForCallback(() => !!(win ?? window).document.head);
}
