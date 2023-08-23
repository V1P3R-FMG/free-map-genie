import { extendState, type FMG_State } from "./state";
import { FMG_MapManager } from "@fmg/map-manager";

export const StoreInstalled = Symbol("StoreInstalled");

export interface WindowExtended extends Window {
    [StoreInstalled]?: FMG_Store;
}

export class FMG_Store {
    private mapManager: FMG_MapManager;
    private store: MG.Store;
    private _getState: () => MG.State;

    private constructor(window: WindowExtended, mapManager: FMG_MapManager) {
        if (!window.store) throw new Error("store not found");

        this.mapManager = mapManager;
        this.store = window.store;

        this._getState = window.store.getState;
        window.store.getState = this.getState.bind(this);
    }

    public getState(): FMG_State {
        return extendState(this._getState(), this.mapManager);
    }

    public static install(
        window: WindowExtended,
        mapManager: FMG_MapManager
    ): FMG_Store {
        if (!window[StoreInstalled]) {
            window[StoreInstalled] = new FMG_Store(window, mapManager);
        }
        return window[StoreInstalled];
    }

    public trackCategory(categoryId: Id, tracked: boolean): void {
        this.store.dispatch({
            type: tracked
                ? "HIVE:USER:ADD_TRACKED_CATEGORY"
                : "HIVE:USER:ADD_TRACKED_CATEGORY",
            meta: {
                categoryId
            }
        });
    }

    public reorderPresets(ordering: number[]): void {
        this.store.dispatch({
            type: "HIVE:USER:REORDER_PRESETS",
            meta: {
                presets: ordering
            }
        });
    }
}
