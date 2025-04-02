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

    /**
     * Subscribe to store/state changes.
     * @param listener a callback to call when changes occur.
     */
    public subscribe(listener: () => void): void {
        this.store.subscribe(listener);
    }

    /**
     * Get the current mg app state wrapped in a custom class.
     * @returns the wrapped mg map app state.
     */
    public getState(): FMG_State {
        return extendState(this._getState(), this.mapManager);
    }

    /**
     * Initialize this store class injector.
     * @param window the window to attach on.
     * @param mapManager the fmg mapmannager for the given window.
     * @returns the injected class instance.
     */
    public static install(
        window: WindowExtended,
        mapManager: FMG_MapManager
    ): FMG_Store {
        if (!window[StoreInstalled]) {
            window[StoreInstalled] = new FMG_Store(window, mapManager);
        }
        return window[StoreInstalled];
    }

    /**
     * Track or untrack multiple categories.
     * @param categoryId the locations to (un)track.
     * @param track a boolean value true to track and false to untrack.
     */
    public trackCategory(categoryId: Id, tracked: boolean): void {
        this.store.dispatch({
            type: tracked
                ? "MG:USER:ADD_TRACKED_CATEGORY"
                : "MG:USER:ADD_TRACKED_CATEGORY",
            meta: {
                categoryId
            }
        });
    }

    /**
     * Reorder the presets.
     * @param ordering the new ordering for the presets.
     */
    public reorderPresets(ordering: number[]): void {
        this.store.dispatch({
            type: "MG:USER:REORDER_PRESETS",
            meta: {
                presets: ordering
            }
        });
    }

    /**
     * Force a location update.
     */
    public updateLocations(): void {
        this.store.dispatch({
            type: "MG:USER:MARK_LOCATION",
            meta: { locationId: -1, found: false }
        });
    }

    /**
     * Force a category update.
     */
    public updateCategories(): void {
        this.store.dispatch({ type: "MG:USER:UPDATE_CATEGORY_PROGRESS" });
    }
}
