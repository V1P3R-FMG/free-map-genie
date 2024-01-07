import type { FMG_MapManager } from "@fmg/map-manager";
import { FMG_Checkbox } from "./checkbox";
import { FMG_Maps } from "@fmg/info";

export class FMG_CheckboxManager {
    public readonly window: Window;
    public readonly checkboxes: FMG_Checkbox[] = [];
    private _mapManager?: FMG_MapManager;

    constructor(window: Window) {
        this.window = window;
    }

    public get mapManager(): FMG_MapManager {
        if (!this._mapManager) throw new Error("MapManager not set.");
        return this._mapManager;
    }

    public set mapManager(mapManager: FMG_MapManager) {
        this._mapManager = mapManager;
        this.checkboxes.length = 0;
        this.checkboxes.push(...[...this.window.document
            .querySelectorAll("input.check[data-location-id]")]
            .map(input => {
                const checkbox = new FMG_Checkbox(input as HTMLInputElement);
                checkbox.onChange(() => this.onChange(checkbox));
                return checkbox;
            }));
    }

    private async getMapId(checkbox: FMG_Checkbox) {
        if (!checkbox.mapId) {
            const id = checkbox.input.getAttribute("data-map-id");
            if (id !== undefined && id !== null) {
                checkbox.mapId = id;
            } else {
                const gameId = this.mapManager.storage.keys.keyData.gameId;
                const maps = FMG_Maps.forGame(gameId);
                const map = await maps.getMapForLocation(checkbox.locationId);
                checkbox.mapId = map.map.id;
            }
        }
        return checkbox.mapId!;
    }

    private async onChange(checkbox: FMG_Checkbox) {
        const locationId = checkbox.locationId;
        const mapId = await this.getMapId(checkbox);
        const key = this.mapManager.storage.keys.getV2KeyForMap(mapId);
        if (checkbox.isMarked) {
            this.mapManager.storage.all[key].locations[locationId] = true;
        } else {
            delete this.mapManager.storage.all[key].locations[locationId];
        }
        this.mapManager.markLocationFound(locationId, checkbox.isMarked);
    }

    public mark(locationId: Id, marked: boolean) {
        this.checkboxes
            .find((c) => c.locationId == locationId)
            ?.mark(marked);
    }

    public reload() {
        this.checkboxes.forEach(checkbox => {
            const value = Object.values(this.mapManager.storage.all).some(
                (data) => data.locations[checkbox.locationId] ?? false
            );
            checkbox.mark(value);
        });
    }
}
