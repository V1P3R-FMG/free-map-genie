import { sleep, timeout, waitForCallback } from "./async";

export function getElement<T extends Element>(
    selector: string,
    winOrElement?: Window | Element,
    timeoutTime: number = -1
): Promise<T> {
    return timeout((async () => {
        const parent = winOrElement !== undefined 
            ? winOrElement instanceof Element
                ? winOrElement
                : winOrElement.document
            : window.document;
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

/**
 * Wait for document loaded
 * @param win the window to check.
 * @param timeoutTime reject promise if we are waiting longer then given timeout -1 for no rejection.
 * @returns 
 */
export function documentLoaded(win?: Window, timeoutTime: number = -1): Promise<void> {
    return waitForCallback(() => (win ?? window).document.readyState === "complete", timeoutTime);
}

/**
 * Wait for document loaded
 * @param win the window to check.
 * @param timeoutTime reject promise if we are waiting longer then given timeout -1 for no rejection.
 * @returns 
 */
export async function waitForBody(win?: Window, timeoutTime: number = -1): Promise<void> {
    await waitForCallback(() => !!(win ?? window).document.body, timeoutTime);
}

/**
 * Wait for document loaded
 * @param win the window to check.
 * @param timeoutTime reject promise if we are waiting longer then given timeout -1 for no rejection.
 * @returns 
 */
export async function waitForHead(win?: Window, timeoutTime: number = -1): Promise<void> {
    await waitForCallback(() => !!(win ?? window).document.head, timeoutTime);
}
