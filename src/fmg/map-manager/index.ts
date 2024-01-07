import { FMG_Storage } from "@fmg/storage";
import { FMG_Store } from "@fmg/store";
import { FMG_KeyDataHelper } from "@fmg/storage/helpers/key-data";
import { FMG_Popup } from "./popup";

import { FMG_ImportHelper } from "@fmg/storage/data/import";
import { FMG_ExportHelper } from "@fmg/storage/data/export";

export class FMG_MapManager {
    public window: Window;
    public popup?: FMG_Popup;
    
    public _storage?: FMG_Storage;
    private _store?: FMG_Store;
    private _autoPanPopup?: MG.MapManager["autoPanPopup"]; 

    public constructor(window: Window) {
        this.window = window;
    }

    public get storage(): FMG_Storage {
        if (!this._storage) {
            this._storage = new FMG_Storage(
                this.window,
                this.window.user
                    ? FMG_KeyDataHelper.fromWindow(this.window)
                    : FMG_KeyDataHelper.fromWindowAndUser(this.window, -1000)
            );
        }
        return this._storage;
    }

    /**
     * Get the fmg store.
     */
    public get store(): FMG_Store {
        if (!this._store) throw new Error("Store not initialized");
        return this._store;
    }

    /**
     * Initialize the map manager.
     */
    public init() {
        this._store = FMG_Store.install(this.window, this);

        // Check if the mapmanager exists.
        if (!this.window.mapManager) {
            logger.error(
                "window.mapManager not found, could not attach popup fix!"
            );
            return;
        }

        // Store the original autoPanPopup function.
        this._autoPanPopup = this.window.mapManager?.autoPanPopup;

        // Wrap the orgiginal autoPanPopup function.
        // We use this wrapped function to listen for when the popup visibility changes.
        this.window.mapManager.autoPanPopup = () => {
            // Get the current popup
            const popup = this.window.mapManager?.popup;

            // If the popup is not visible exit the function.
            // Or if our fmg popup wrapper intance is the same as the current mg popup exit the function.
            if (!popup || this.popup?.instance === popup) return;

            // Wrap the mg popup.
            this.popup = new FMG_Popup(popup, this);
            
            // And at last call the original autoPanPopup
            this._autoPanPopup?.();
        };

        this.updatePresets();
    }

    /**
     * Check if the current map has a demo preset defined.
     * @returns true if its defined else false.
     */
    public hasDemoPreset(): boolean {
        return (
            this.window.mapData?.presets?.some(
                (preset) => preset.is_demo_preset
            ) ?? false
        );
    }

    /**
     * Update the presets.
     */
    public updatePresets() {
        if (this.storage.data.presets.length === 0) {
            if (this.hasDemoPreset()) {
                this.store.reorderPresets([-1]);
            } else {
                this.store.reorderPresets([]);
            }
        } else {
            this.store.reorderPresets(this.storage.data.presetOrder);
        }
    }

    /**
     * Update the mg popup.
     * This get called when location data changes.
     * To sync the founded checkbox.
     */
    public updatePopup() {
        const location = this.store.getState().map.selectedLocation;
        if (location && this.isPopupOpen()) {
            this.window.mapManager?.openInfoWindow(location);
        }
    }

    /**
     * Get the categories from the current game.
     * @returns the categories for the current game.
     */
    public getCurrentCategories(): MG.Category[] {
        return Object.values(this.store.getState().map.categories);
    }

    /**
     * Checks if mg popup is currently visible.
     * @returns a boolean indicating if its visbile or not.
     */
    public isPopupOpen(): boolean {
        return !!this.window.document.querySelector("#marker-info");
    }

    /**
     * Add a note.
     * @param note the note to add. 
     */
    public addNote(note: MG.Note) {
        this.window.mapManager?.createNote(note);
    }

    /**
     * Remove a note.
     * @param note the note to remove.
     */
    public removeNote(note: MG.Note) {
        this.window.mapManager?.deleteNoteMarker(note);
    }

    /**
     * Add or removed note.
     * @param note the note to add or remove.
     * @param on true to add and false to remove.
     */
    public toggleNote(note: MG.Note, on: boolean) {
        if (on) this.addNote(note);
        else this.removeNote(note);
    }

    /**
     * Get the note from note id from the given notes array,
     * or if not provided from the current saved notes.
     * @param noteId the note id to get.
     * @param notes the notes array to get the note from.
     * @returns a note if found else undefined.
     */
    public getNote(noteId: string, notes?: MG.Note[]): MG.Note | undefined {
        notes = notes ?? this.storage.data.notes;
        return notes.find((n) => noteId === n.id);
    }

    /**
     * Checks if the note id exists in the given notes array,
     * or if not provied from the current saved notes.
     * @param noteId the note id to check.
     * @param notes the notes array to check for the given note.
     * @returns a boolean indication if the note was found in the given array.
     */
    public hasNote(noteId: string, notes?: MG.Note[]) {
        return !!this.getNote(noteId, notes);
    }

    /**
     * Loads the storage data.
     */
    public async load() {
        await this.storage.load();
    }

    /**
     * Saves the storage data.
     */
    public async save() {
        await this.storage.save();
    }

    /**
     * Mark or unmark location on the map
     * @param locationId the location to (un)mark.
     * @param found a boolean value true to mark and false to unmark.
     */
    public markLocationFound(locationId: Id, found: boolean) {
        this.window.mapManager?.setLocationFound(locationId, found);
    }

    /**
     * Mark or unmark multiple location on the map.
     * @param locationIds the locations to (un)mark.
     * @param found either a object with id as keys and boolean as value or a single boolean value.
     */
    public markLocationsFound(locationIds: Id[], found: boolean): void;
    public markLocationsFound(locationIds: Id[], found: Record<Id, boolean>): void;
    public markLocationsFound(locationIds: Id[], found: any) {
        if (typeof found === "boolean") {
            locationIds.forEach(id => this.markLocationFound(id, found));
        } else {
            locationIds.forEach(id => this.markLocationFound(id, found[id]));
        }
    }

    /**
     * Attaches an event listener to the window.
     * @param event the event to listen for.
     * @param callback the callback to call when the event is fired.
     */
    public on<E extends keyof WindowEventMap>(
        event: E,
        callback: (e: WindowEventMap[E]) => void
    ) {
        this.window.addEventListener(event, callback);
    }

    /**
     * Removes an event listener from the window.
     * @param event the event to remove the listener from.
     * @param callback the callback to remove.
     */
    public off(event: keyof WindowEventMap, callback: EventListener) {
        this.window.removeEventListener(event, callback);
    }

    /**
     * Fires an event on the window.
     * @param event the event to fire.
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
        // Store last state notes.
        const lastNotes = this.storage.data.notes;

        // Refetch storage data.
        await this.storage.load();

        // Get current app state.
        const state = this.store.getState();

        // Mark locations and track categories.
        this.markLocationsFound(Object.keys(state.map.locationsById), this.storage.data.locations);
        this.store.trackCategories(state.map.categoryIds, this.storage.data.categories);

        // Update notes, by removing previous notes and adding the current notes.        
        lastNotes.forEach(note => this.removeNote(note));
        this.storage.data.notes.forEach(note => this.addNote(note));

        // Reload presets from storage
        this.updatePresets();

        // Force ui update for locations and categories
        this.store.updateLocations();
        this.store.updateCategories();

        // Finally notify listeners that we updated.
        this.fire("fmg-update");
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
