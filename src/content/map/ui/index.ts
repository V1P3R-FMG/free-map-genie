import { createApp } from "vue";
import Progress from "./progress.vue";
import type { FMG_MapManager } from "@fmg/map-manager";

export class FMG_UI {
    private mapManager: FMG_MapManager;
    public progress: typeof Progress;

    constructor(mapManager: FMG_MapManager) {
        this.mapManager = mapManager;

        this.progress = FMG_UI.attachProgressUI(window);

        this.update();
    }

    private static attachProgressUI(window: Window): typeof Progress {
        const div = window.document.createElement("div");

        const categoryPanel =
            window.document.querySelector("#user-panel .category-progress") ??
            window.document.head;

        categoryPanel.before(div);
        categoryPanel.before(window.document.createElement("hr"));

        return createApp(Progress).mount(div);
    }

    public update() {
        this.progress.update(this.mapManager);
    }
}
