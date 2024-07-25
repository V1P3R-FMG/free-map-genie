export type Context = "main" | "sub" | "extension";

let _context: Context | undefined;

export function isIframeContext(): boolean {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}

export function isExtensionContext(): boolean {
    return window.chrome?.runtime != null;
}

export function getContext(): Context {
    if (!_context) {
        if (isExtensionContext()) {
            _context = "extension";
        } else if (isIframeContext()) {
            _context = "sub";
        } else {
            _context = "main";
        }
    }
    return _context;
}
