import { FMG_Storage } from "@fmg/storage";
import { FMG_Store } from "@fmg/store";
import { FMG_KeyDataHelper } from "@fmg/storage/helpers/key-data";
import { FMG_Popup } from "./popup";

import { FMG_ImportHelper } from "@fmg/storage/data/import";
import { FMG_ExportHelper } from "@fmg/storage/data/export";

export class FMG_MapManager {
    public window: Window;
    public storage: FMG_Storage;
    public popup?: FMG_Popup;
    private _store?: FMG_Store;
    private _autoPanPopup?: MG.MapManager["autoPanPopup"];

    public constructor(window: Window) {
        this.window = window;

        this.storage = new FMG_Storage(
            window,
            FMG_KeyDataHelper.fromWindow(window)
        );
    }

    public get store(): FMG_Store {
        if (!this._store) throw new Error("Store not initialized");
        return this._store;
    }

    public init() {
        this._store = FMG_Store.install(this.window, this);

        if (this.window.mapManager) {
            this._autoPanPopup = this.window.mapManager?.autoPanPopup;
            this.window.mapManager.autoPanPopup = () => {
                const popup = this.window.mapManager?.popup;
                if (!popup || this.popup?.instance === popup) return;
                this.popup = new FMG_Popup(popup, this);
                this._autoPanPopup?.();
            };
        } else {
            logger.error(
                "window.mapManager not found, could not attach popup fix!"
            );
        }

        this.updatePresets();
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
            } else {
                this.store.reorderPresets([]);
            }
            return;
        }
        this.store.reorderPresets(this.storage.data.presetOrder);
    }

    public updatePopup() {
        const location = this.store.getState().map.selectedLocation;
        if (location && this.isPopupOpen()) {
            this.window.mapManager?.openInfoWindow(location);
        }
    }

    public getCurrentCategories(): MG.Category[] {
        return Object.values(this.store.getState().map.categories);
    }

    public isPopupOpen(): boolean {
        return !!this.window.document.querySelector("#marker-info");
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

    public markLocationFound(locationId: Id, found: boolean) {
        this.window.mapManager?.setLocationFound(locationId, found);
    }

    /**
     * Attaches an event listener to the window.
     * @param event the event to listen for
     * @param callback the callback to call when the event is fired
     */
    public on<E extends keyof WindowEventMap>(
        event: E,
        callback: (e: WindowEventMap[E]) => void
    ) {
        this.window.addEventListener(event, callback);
    }

    /**
     * Removes an event listener from the window.
     * @param event the event to remove the listener from
     * @param callback the callback to remove
     */
    public off(event: keyof WindowEventMap, callback: EventListener) {
        this.window.removeEventListener(event, callback);
    }

    /**
     * Fires an event on the window.
     * @param event the event to fire
     */
    public fire<T extends keyof WindowFmgEventsMap>(
        event: T,
        detail?: WindowEventMap[T]["detail"]
    ) {
        this.window.dispatchEvent(
            new CustomEvent(event, {
                detail
            })
        );
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
            this.markLocationFound(
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

    /**
     * Import data from a file.
     */
    public async import() {
        await FMG_ImportHelper.import(this.storage.driver, this.storage.keys);
        await this.reload();
    }

    /**
     * Export data from a file.
     */
    public async export() {
        await FMG_ExportHelper.export(this.storage.driver, this.storage.keys);
    }
}
