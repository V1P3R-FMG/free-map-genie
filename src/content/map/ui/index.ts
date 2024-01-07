import { createApp } from "vue";
import Progress from "./progress.vue";
import MarkControls from "./mark-controls.vue";
import type { FMG_MapManager } from "@fmg/map-manager";
import { getElement } from "@shared/dom";

export class FMG_UI {
    private mapManager: FMG_MapManager;
    private _totalProgress?: typeof Progress;
    private _trackedProgress?: typeof Progress;
    private _markControls?: typeof MarkControls;

    constructor(mapManager: FMG_MapManager) {
        this.mapManager = mapManager;
    }

    public get totalProgress(): typeof Progress {
        if (!this._totalProgress) throw new Error("UI not attached.");
        return this._totalProgress;
    }

    public get trackedProgress(): typeof Progress {
        if (!this._trackedProgress) throw new Error("UI not attached.");
        return this._trackedProgress;
    }

    public get markControls(): typeof MarkControls {
        if (!this._markControls) throw new Error("UI not attached.");
        return this._markControls;
    }

    private getPanel(): Promise<HTMLElement> {
        return getElement("#user-panel", this.mapManager.window, 5000);
    }

    private async getCategoryPanel(): Promise<HTMLElement> {
        return getElement(".category-progress", this.mapManager.window, 5000);
    }

    private getBottomRightControlContainer(): Promise<HTMLElement> {
        return getElement(".mapboxgl-ctrl-bottom-right", this.mapManager.window, 5000);
    }

    private createHorizontalRule(): HTMLHRElement {
        return document.createElement("hr");
    }

    private createBeforeDiv(element: HTMLElement): HTMLDivElement {
        const div = document.createElement("div");
        element.before(div);
        return div;
    }

    private createDiv(element: HTMLElement): HTMLDivElement {
        const div = document.createElement("div");
        element.appendChild(div);
        return div;
    }

    private mount(
        element: HTMLElement,
        component: any,
        props?: { [key: string]: any }
    ): any {
        return createApp(component, props).mount(element);
    }

    private async attachTotalProgressUI(): Promise<typeof Progress> {
        const categoryPanel = await this.getCategoryPanel();
        const div = this.createBeforeDiv(categoryPanel);
        categoryPanel.before(this.createHorizontalRule());
        return this.mount(div, Progress, {
            calculateTotal: () => {
                return [
                    this.mapManager.store.getState().map.locations.length,
                    this.mapManager.storage.data.locationIds.length
                ];
            }
        });
    }

    private async attachTrackedProgressUI(): Promise<typeof Progress> {
        const categoryPanel = await this.getCategoryPanel();
        return this.mount(this.createBeforeDiv(categoryPanel), Progress, {
            calculateTotal: () => {
                let [total, marked] = [0, 0];
                const locByCat =
                    this.mapManager.store.getState().map.locationsByCategory;
                const data = this.mapManager.storage.data;
                data.categoryIds.forEach((catId) => {
                    const locations = locByCat[catId] ?? [];
                    total += locations.length;
                    locations.forEach((loc) => {
                        if (data.locations[loc.id]) marked++;
                    });
                });
                return [total, marked];
            }
        });
    }

    private async attachMarkControlsUI(): Promise<typeof MarkControls> {
        const container = await this.getBottomRightControlContainer();
        return this.mount(this.createDiv(container), MarkControls, {
            mapManager: this.mapManager
        });
    }

    public async attach() {
        this._totalProgress = await this.attachTotalProgressUI();
        this._trackedProgress = await this.attachTrackedProgressUI();
        this._markControls = await this.attachMarkControlsUI();
    }

    public update() {
        this.totalProgress.update();
        this.trackedProgress.update();
    }
}
