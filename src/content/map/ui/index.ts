import { createApp } from "vue";
import Progress from "./progress.vue";
import MarkControls from "./mark-controls.vue";
import type { FMG_MapManager } from "@fmg/map-manager";

export class FMG_UI {
    private mapManager: FMG_MapManager;
    public readonly totalProgress: typeof Progress;
    public readonly trackedProgress: typeof Progress;
    public readonly markControls: typeof MarkControls;

    constructor(mapManager: FMG_MapManager) {
        this.mapManager = mapManager;

        this.totalProgress = this.attachTotalProgressUI();
        this.trackedProgress = this.attachTrackedProgressUI();
        this.markControls = this.attachMarkControlsUI();

        this.update();
    }

    private getPanel(): HTMLElement {
        const panel =
            this.mapManager.window.document.querySelector<HTMLElement>(
                "#user-panel"
            );
        if (!panel) {
            throw new Error("Could not find user panel");
        }
        return panel;
    }

    private getCategoryPanel(): HTMLElement {
        const panel = this.getPanel();
        const categoryPanel =
            panel.querySelector<HTMLElement>(".category-progress");
        if (!categoryPanel) {
            throw new Error("Could not find category panel");
        }
        return categoryPanel;
    }

    private getBottomRightControlContainer(): HTMLElement {
        const container =
            this.mapManager.window.document.querySelector<HTMLElement>(
                ".mapboxgl-ctrl-bottom-right"
            );
        if (!container) {
            throw new Error("Could not find bottom right control container");
        }
        return container;
    }

    private createHorizontalRule(): HTMLHRElement {
        return this.mapManager.window.document.createElement("hr");
    }

    private createBeforeDiv(element: HTMLElement): HTMLDivElement {
        const div = window.document.createElement("div");
        element.before(div);
        return div;
    }

    private createDiv(element: HTMLElement): HTMLDivElement {
        const div = window.document.createElement("div");
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

    private attachTotalProgressUI(): typeof Progress {
        const categoryPanel = this.getCategoryPanel();
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

    private attachTrackedProgressUI(): typeof Progress {
        const categoryPanel = this.getCategoryPanel();
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

    private attachMarkControlsUI(): typeof MarkControls {
        const container = this.getBottomRightControlContainer();
        return this.mount(this.createDiv(container), MarkControls, {
            mapManager: this.mapManager
        });
    }

    public update() {
        this.totalProgress.update();
        this.trackedProgress.update();
    }
}
