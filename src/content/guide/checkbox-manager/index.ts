import type { FMG_MapManager } from "@fmg/map-manager";
import { FMG_Checkbox } from "./checkbox";

export class FMG_CheckboxManager {
    private readonly mapManager: FMG_MapManager;
    public readonly checkboxes: FMG_Checkbox[] = [];

    constructor(window: Window, mapManager: FMG_MapManager) {
        this.mapManager = mapManager;
        window.document
            .querySelectorAll("input.check[data-location-id]")
            .forEach((input) => {
                this.checkboxes.push(
                    new FMG_Checkbox(input as HTMLInputElement, mapManager)
                );
            });
    }

    public mark(locationId: Id, marked: boolean) {
        this.checkboxes
            .find((c) => c.getLocationId() == locationId)
            ?.mark(marked);
    }

    public reload() {
        this.checkboxes.forEach((c) => {
            c.load();
        });
    }
}
