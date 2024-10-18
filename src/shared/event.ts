import debounce from "@utils/debounce";

export type DocumentVisibliityChangedCallback = (visible: boolean) => void;

const documentFocusedCallbacks: Set<DocumentVisibliityChangedCallback> = new Set();

export function onDocumentFocusChanged(cb: DocumentVisibliityChangedCallback) {
    documentFocusedCallbacks.add(cb);

    return () => offDocumentFocusChanged(cb);
}

export function offDocumentFocusChanged(cb: DocumentVisibliityChangedCallback) {
    documentFocusedCallbacks.delete(cb);
}

document.addEventListener(
    "visibilitychange",
    debounce(() => {
        const visible = document.visibilityState === "visible";
        documentFocusedCallbacks.forEach((cb) => cb(visible));
    }, 250)
);
