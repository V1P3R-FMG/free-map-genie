import debounce from "@utils/debounce";

export interface ReloadCallback {
    (): void;
}

class PageService {
    private onReloadCallbacks: ReloadCallback[] = [];

    constructor() {
        document.addEventListener(
            "visibilitychange",
            debounce(() => {
                switch (document.visibilityState) {
                    case "visible":
                        this.onReloadCallbacks.forEach((cb) => cb());
                        break;
                }
            }, 250)
        );
    }

    public set onreload(cb: ReloadCallback) {
        this.onReloadCallbacks.push(cb);
    }
}

export default new PageService();
