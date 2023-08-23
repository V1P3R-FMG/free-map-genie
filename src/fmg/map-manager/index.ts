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
        this._store = FMG_Store.install(window, this);
    }

    public hasDemoPreset(): boolean {
        return (
            this.window.mapData?.presets?.some(
                (preset) => preset.is_demo_preset
            ) ?? false
        );
    }

    public updatePresets() {
        if (this.storage.data.presets.length === 0) {
            if (this.hasDemoPreset()) {
                this.store.reorderPresets([-1]);
            }
            return;
        }
        this.store.reorderPresets(this.storage.data.presetOrder);
    }

    public updatePopup() {
        const location = this.store.getState().map.selectedLocation;
        if (location) {
            this.window.mapManager?.openInfoWindow(location);
        }
    }

    public addNote(note: MG.Note) {
        this.window.mapManager?.createNote(note);
    }

    public removeNote(note: MG.Note) {
        this.window.mapManager?.deleteNoteMarker(note);
    }

    public async load() {
        await this.storage.load();
    }

    public async save() {
        await this.storage.save();
    }

    /**
     * Resync the map data.
     * This makes it possible to open multiple tabs of the same map at the same time.
     * Or if you have the map op and guide at the same time.
     */
    public async reload() {
        const lastNotes = this.storage.data.notes;
        await this.storage.load();
        const notes = this.storage.data.notes;

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

        // Remove notes that are not in the storage anymore
        lastNotes.forEach((note) => {
            if (!notes.find((n) => note.id === n.id)) {
                this.removeNote(note);
            }
        });

        // Add notes that are not in the state yet
        notes.forEach((note) => {
            if (!lastNotes.find((n) => note.id === n.id)) {
                this.addNote(note);
            }
        });

        // Reload presets from storage
        this.updatePresets();
    }
}
