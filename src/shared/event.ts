import debounce from "@utils/debounce";

const documentFocusedCallbacks: Set<() => void> = new Set();

export function onDocumentFocused(cb: () => void) {
    documentFocusedCallbacks.add(cb);

    return () => offDocumentFocused(cb);
}

export function offDocumentFocused(cb: () => void) {
    documentFocusedCallbacks.delete(cb);
}

document.addEventListener(
    "visibilitychange",
    debounce(() => {
        switch (document.visibilityState) {
            case "visible":
                documentFocusedCallbacks.forEach((cb) => cb());
                break;
        }
    }, 250)
);
