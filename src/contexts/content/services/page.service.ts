import { onDocumentFocused } from "@shared/event";

export interface ReloadCallback {
    (): void;
}

class PageService {
    private onReloadCallbacks: ReloadCallback[] = [];

    constructor() {
        onDocumentFocused(() => this.onReloadCallbacks.forEach((cb) => cb()));
    }

    public set onreload(cb: ReloadCallback) {
        this.onReloadCallbacks.push(cb);
    }
}

export default new PageService();
