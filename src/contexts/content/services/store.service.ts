import * as async from "@utils/async";
import Key from "@content/storage/key";

import storageService from "./storage.service";

class StoreService {
    private _getState?: () => MG.State;

    public async install() {
        const store = await this.waitForStore();

        this._getState = store.getState;

        store.getState = () => {
            const state = this._getState!();

            const data = storageService.loadFromCache(Key.fromWindow(window));
            if (!data) return state;

            state.user.foundLocations = data.locations;
            state.user.foundLocationsCount = data.locations.size;
            state.user.trackedCategories = data.categories.values();
            state.user.totalFoundLocationsCount = data.locations.size;

            state.user.notes = data.notes as MG.Note[];

            return state;
        };
    }

    public async waitForStore() {
        await async.waitForCondition(() => !!window.store, { message: "Wait for window.store took to long." });
        return window.store!;
    }

    public get store() {
        if (!window.store) throw "window.store is not defined";
        return window.store;
    }

    public async dispatch<T extends MG.StateActionType>(action: { type: T; meta: MG.MetaForActionType<T> }) {
        this.store.dispatch(action);
    }

    public async updateFoundLocationsCount(count: number) {
        await this.dispatch({
            type: "MG:USER:UPDATE_FOUND_LOCATIONS_COUNT",
            meta: { count },
        });
    }
}

export default new StoreService();
