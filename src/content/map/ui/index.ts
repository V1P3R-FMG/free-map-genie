import { createApp } from "vue";
import Progress from "./progress.vue";
import type { FMG_MapManager } from "@fmg/map-manager";

export class FMG_UI {
    private mapManager: FMG_MapManager;
    public totalProgress: typeof Progress;
    public trackedProgress: typeof Progress;

    constructor(mapManager: FMG_MapManager) {
        this.mapManager = mapManager;

        this.totalProgress = this.attachTotalProgressUI();
        this.trackedProgress = this.attachTrackedProgressUI();

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

    private createHorizontalRule(): HTMLHRElement {
        return this.mapManager.window.document.createElement("hr");
    }

    private mountBeforeUI(
        element: HTMLElement,
        component: any,
        props?: { [key: string]: any },
        hr: boolean = true
    ): any {
        const div = window.document.createElement("div");
        element.before(div);
        if (hr) {
            element.before(this.createHorizontalRule());
        }
        return createApp(component, props).mount(div);
    }

    private attachTotalProgressUI(): typeof Progress {
        const categoryPanel = this.getCategoryPanel();
        return this.mountBeforeUI(categoryPanel, Progress, {
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
        return this.mountBeforeUI(
            categoryPanel,
            Progress,
            {
                calculateTotal: () => {
                    let [total, marked] = [0, 0];
                    const locByCat =
                        this.mapManager.store.getState().map
                            .locationsByCategory;
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
            },
            false
        );
    }

    public update() {
        this.totalProgress.update();
        this.trackedProgress.update();
    }
}
