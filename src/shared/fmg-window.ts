import * as async from "@utils/async";

export default class FmgWindow {
    public readonly win: Window;

    private constructor(win: Window) {
        this.win = win;
    }

    get document(): Document {
        return this.win.document;
    }

    get axios(): Axios {
        if (!this.win.axios) {
            throw "Window has no axios object";
        }
        return this.win.axios;
    }

    get mapManager(): MG.MapManager {
        if (!this.win.mapManager) {
            throw "Window has no mapManager object";
        }
        return this.win.mapManager;
    }

    public async waitForAxios(timeout?: number): Promise<Axios> {
        await async.waitForCondition(() => !!this.win.axios, {
            timeout,
            message: "Waiting for window.axios took to long",
            interval: 0,
        });
        return this.win.axios!;
    }

    public static from(win: Window | FmgWindow): FmgWindow {
        if (win instanceof this) {
            return win;
        }
        return new this(win);
    }
}
