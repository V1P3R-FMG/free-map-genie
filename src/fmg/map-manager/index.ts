import { FMG_Storage } from "@fmg/storage";
import { FMG_Store } from "@fmg/store";
import { FMG_KeyDataHelper } from "@fmg/storage/helpers/key-data";
import { FMG_Popup } from "./popup";

import { FMG_ImportHelper } from "@fmg/storage/data/import";
import { FMG_ExportHelper } from "@fmg/storage/data/export";
import type { FMG_Data } from "@fmg/storage/proto/data";

import { getDiffForDicyById } from "@shared/utils";

export class FMG_MapManager {
    public window: Window;
    public popup?: FMG_Popup;
    
    private _storage?: FMG_Storage;
    private _store?: FMG_Store;
    private _autoPanPopup?: MG.MapManager["autoPanPopup"]; 
    private _defaultPresetsIds?: number[];

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

    public get defaultPresetsIds() {
        if (!this.window.mapData) {
            throw new Error(`Failed to get defaultPresetIds, Mapdata not defined!`);
        }

        if (!this._defaultPresetsIds) {
            this._defaultPresetsIds = this.window.mapData.presets
                .filter((preset) => preset.is_demo_preset)
                .map((preset) => preset.id);
        }

        return this._defaultPresetsIds;
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
        return !!this.defaultPresetsIds.length;
    }

    /**
     * Get a default preset from id.
     * @returns the default preset.
     */
    public getDefaultPreset(id: Id): MG.Preset {
        if (!this.window.mapData) {
            throw new Error(`Failed to get default preset with id ${id}, Mapdata not defined.`);
        }
        const preset = this.window.mapData.presets.find((preset) => preset.id == id);

        if (!preset) {
            throw new Error(`Default preset wit id ${id} not found.`);
        }

        return preset;
    }

    /**
     * Update the presets.
     */
    public updatePresets() {
        if (this.storage.data.presets.length === 0) {
            this.store.reorderPresets(this.defaultPresetsIds);
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
     * Track or untrack multiple categories.
     * @param categoryId the locations to (un)track.
     * @param track a boolean value true to track and false to untrack.
     */
    public trackCategory(categoryId: Id, tracked: boolean): void {
        this.store.trackCategory(categoryId, tracked);
    }

    /**
     * Track or untrack multiple categories.
     * @param categoryIds the locations to (un)track.
     * @param tracked either a object with id as keys and boolean as value or a single boolean value.
     */
    public trackCategories(categoryIds: Id[], tracked: boolean): void;
    public trackCategories(categoryIds: Id[], tracked: Record<Id, boolean>): void;
    public trackCategories(categoryIds: Id[], tracked: any) {
        if (typeof tracked === "boolean") {
            categoryIds.forEach(id => this.trackCategory(id, tracked));
        } else {
            categoryIds.forEach(id => this.trackCategory(id, tracked[id] ?? false));
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
        const previousData = this.storage.data;

        // Refetch storage data.
        await this.storage.load();
        const currentData = this.storage.data;

        // Mark locations
        const diffLocations = getDiffForDicyById(previousData.locations, currentData.locations);
        this.markLocationsFound(diffLocations.added, true);
        this.markLocationsFound(diffLocations.removed, false);
        
        // track categories.
        const diffCategories = getDiffForDicyById(previousData.categories, currentData.categories);
        this.trackCategories(diffCategories.added, true);
        this.trackCategories(diffCategories.removed, false);

        // Update notes, by removing previous notes and adding the current notes.        
        previousData.notes.forEach(note => this.removeNote(note));
        currentData.notes.forEach(note => this.addNote(note));

        // Reload presets from storage
        this.updatePresets();

        this.refresh();
    }

    /**
     * Refresh ui data
     */
    public refresh() {
        // Force ui update for locations and categories
        this.store.updateLocations();
        this.store.updateCategories();

        // Finally notify listeners that we updated.
        this.fire("fmg-update");
    }

    /**
     * Import data from a file.
     */
    public async import(json: string) {
        await FMG_ImportHelper.import(this.storage.driver, this.storage.keys, json);
        await this.reload();
    }

    /**
     * Export data from a file.
     */
    public async export() {
        return FMG_ExportHelper.export(this.storage.driver, this.storage.keys);
    }
}
