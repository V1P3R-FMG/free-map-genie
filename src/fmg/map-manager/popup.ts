import type { FMG_MapManager } from ".";
import clipboard from "@shared/clipboard";

export class FMG_Popup {
    public instance: MG.Popup;
    private mapManager: FMG_MapManager;

    constructor(popup: MG.Popup, mapManager: FMG_MapManager) {
        this.instance = popup;
        this.mapManager = mapManager;

        this.fixLocationPermaLink();
    }

    private fixLocationPermaLink(): void {
        const link =
            this.instance._content.querySelector<HTMLElement>("i.ion-ios-link");
        const fmgLink = link?.cloneNode(true) as HTMLElement | undefined;
        if (!link || !fmgLink) return;
        fmgLink.setAttribute("data-title", "FMG Link Copied");
        fmgLink.style.color = "#71e189";
        fmgLink.addEventListener("click", (e) => {
            const url = new URL(window.location.href);
            url.searchParams.set("locationIds", this.instance.locationId + "");
            clipboard(url.href);
            $(fmgLink).tooltip("show");
            setTimeout(() => $(fmgLink).tooltip("hide"), 2000);
        });
        link.after(fmgLink);
    }
}
