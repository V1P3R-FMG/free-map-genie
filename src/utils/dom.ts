import { waitForCondition } from "./async";

export async function waitForHead(document: Document, timeout?: number) {
    await waitForCondition(() => !!document.head, {
        interval: 0,
        timeout,
        message: "Waiting for head took to long.",
    });
    return document.head;
}

export async function waitForBody(document: Document, timeout?: number) {
    await waitForCondition(() => !!document.body, {
        interval: 0,
        timeout,
        message: "Waiting for body took to long.",
    });
    return document.body;
}

export async function waitForContentWindow(iframe: HTMLIFrameElement, timeout?: number) {
    await waitForCondition(() => !!iframe.contentWindow, {
        interval: 0,
        timeout,
        message: "Waiting for iframe.contentWindow took to long.",
    });
    return iframe.contentWindow!;
}
