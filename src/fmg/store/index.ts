import type { FMG_Storage } from "@fmg/storage";
import { extendState, type FMG_State } from "./state";

export const StoreInstalled = Symbol("StoreInstalled");

export interface WindowExtended extends Window {
    [StoreInstalled]?: FMG_Store;
}

export class FMG_Store {
    private storage: FMG_Storage;
    private _getState: () => MG.State;

    private constructor(window: WindowExtended, storage: FMG_Storage) {
        if (!window.store) throw new Error("store not found");

        this.storage = storage;

        this._getState = window.store.getState;
        window.store.getState = this.getState.bind(this);
    }

    public getState(): FMG_State {
        return extendState(this._getState(), this.storage);
    }

    public static install(window: WindowExtended, storage: FMG_Storage) {
        if (!window[StoreInstalled]) {
            window[StoreInstalled] = new FMG_Store(window, storage);
        }
        return window[StoreInstalled];
    }
}