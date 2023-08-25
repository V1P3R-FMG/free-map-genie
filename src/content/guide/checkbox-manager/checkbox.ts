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

        this.input.addEventListener("change", async () => {
            await this.mark(this.input.checked);
        });
    }

    private replaceInput(input: HTMLInputElement): HTMLInputElement {
        const clone = input.cloneNode(true) as HTMLInputElement;
        clone.classList.add("fmg-checkbox");
        input.parentElement?.appendChild(clone);
        input.style.display = "none";
        return clone;
    }

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

    public async getMapId(): Promise<Id> {
        if (this.mapId) return this.mapId;
        const maps = FMG_Maps.get(this.mapManager.storage.keys.keyData.gameId);
        const map = await maps.getMapForLocation(this.getLocationId());
        this.mapId = map.map.id;
        return this.mapId;
    }

    public async mark(marked: boolean) {
        const locationId = this.getLocationId();
        const mapId = await this.getMapId();
        const key = this.mapManager.storage.keys.getV2KeyForMap(mapId);
        if (marked) {
            this.mapManager.storage.all[key].locations[locationId] = true;
        } else {
            delete this.mapManager.storage.all[key].locations[locationId];
        }
    }

    private _mark(marked: boolean) {
        this.input.checked = marked;
    }

    public async load() {
        const locationId = this.getLocationId();
        const value = Object.values(this.mapManager.storage.all).some(
            (data) => data.locations[locationId]
        );
        this._mark(value);
    }
}
