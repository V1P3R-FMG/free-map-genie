import { onDocumentFocusChanged } from "@shared/event";

export interface ReloadCallback {
    (): void;
}

class PageService {
    private onReloadCallbacks: ReloadCallback[] = [];

    constructor() {
        onDocumentFocusChanged((visilbe) => (visilbe ? this.onReloadCallbacks.forEach((cb) => cb()) : void 0));
    }

    public set onreload(cb: ReloadCallback) {
        this.onReloadCallbacks.push(cb);
    }
}

export default new PageService();
