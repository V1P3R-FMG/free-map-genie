import { FMG_Storage } from "@fmg/storage";
import { FMG_Store } from "@fmg/store";
import { FMG_KeyDataHelper } from "@fmg/storage/helpers/key-data";

export class FMG_MapManager {
    public window: Window;
    private _storage?: FMG_Storage;
    private _store?: FMG_Store;

    public constructor(window: Window) {
        this.window = window;
    }

    public get storage(): FMG_Storage {
        if (!this._storage) throw new Error("Storage not initialized");
        return this._storage;
    }

    public get store(): FMG_Store {
        if (!this._store) throw new Error("Store not initialized");
        return this._store;
    }

    public initStorage() {
        this._storage = new FMG_Storage(
            window,
            FMG_KeyDataHelper.fromWindow(window)
        );
    }

    public initStore() {
        this._store = FMG_Store.install(window, this.storage);
    }

    public async load() {
        await this.storage.load();
    }

    public async save() {
        await this.storage.save();
    }

    public async reload() {
        await this.storage.load();

        const state = this.store.getState();

        // Reload locations from storage
        state.map.locations.forEach((location) => {
            this.window.mapManager?.setLocationFound(
                location.id,
                this.storage.data.locations[location.id] ?? false
            );
        });

        // Reload categories from storage
        state.map.categoryIds.forEach((categoryId) => {
            this.store.trackCategory(
                categoryId,
                this.storage.data.categories[categoryId] ?? false
            );
        });
    }
}
