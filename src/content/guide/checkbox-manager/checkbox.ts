import type { FMG_MapManager } from "@fmg/map-manager";
import { FMG_Maps } from "@fmg/info";

export class FMG_Checkbox {
    private input: HTMLInputElement;
    private mapManager: FMG_MapManager;

    private mapId?: Id;
    private locationId?: Id;

    constructor(input: HTMLInputElement, mapManager: FMG_MapManager) {
        this.input = this.replaceInput(input);

        this.mapManager = mapManager;

        // We watch for changes to the checkbox
        this.input.addEventListener("change", async () => {
            await this._mark(this.input.checked);
        });
    }

    /**
     * Replaces Mapgenie's checkbox with our own
     * @param input the input element to replace
     * @returns the new input element
     */
    private replaceInput(input: HTMLInputElement): HTMLInputElement {
        const clone = input.cloneNode(true) as HTMLInputElement;
        clone.classList.add("fmg-checkbox");
        input.parentElement?.appendChild(clone);
        input.style.display = "none";
        return clone;
    }

    /**
     * Get the location id for this checkbox
     * @returns the location id
     */
    public getLocationId(): Id {
        if (this.locationId) return this.locationId;
        // Get location id
        const id = this.input.getAttribute("data-location-id");
        if (!id) {
            throw new Error("Input element is missing data-location-id");
        }
        this.locationId = id;
        return this.locationId;
    }

    /**
     * Get the map id for this checkbox
     * @returns the map id
     */
    public async getMapId(): Promise<Id> {
        if (this.mapId) return this.mapId;
        const id = this.input.getAttribute("data-map-id");
        if (id) {
            this.mapId = id;
            return this.mapId;
        } else {
            const maps = FMG_Maps.get(
                this.mapManager.storage.keys.keyData.gameId
            );
            const map = await maps.getMapForLocation(this.getLocationId());
            this.mapId = map.map.id;
            return this.mapId;
        }
    }

    /**
     * Mark the checkbox as checked or not
     * @param marked whether the checkbox should be marked or not
     */
    private async _mark(marked: boolean): Promise<void> {
        const locationId = this.getLocationId();
        const mapId = await this.getMapId();
        const key = this.mapManager.storage.keys.getV2KeyForMap(mapId);
        if (marked) {
            this.mapManager.storage.all[key].locations[locationId] = true;
        } else {
            delete this.mapManager.storage.all[key].locations[locationId];
        }
        this.mapManager.markLocationFound(locationId, marked);
    }

    /**
     * Visualy mark the checkbox as checked or not
     * @param marked whether the checkbox should be marked or not
     */
    public mark(marked: boolean): void {
        this.input.checked = marked;
    }

    /**
     * Load the checkbox state from storage
     */
    public async load(): Promise<void> {
        const locationId = this.getLocationId();
        const value = Object.values(this.mapManager.storage.all).some(
            (data) => data.locations[locationId] ?? false
        );
        this.mark(value);
    }
}
