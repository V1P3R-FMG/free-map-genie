import type { FMG_MapManager } from ".";
import clipboard from "@shared/clipboard";

export class FMG_Popup {
    public instance: MG.Popup;
    private mapManager: FMG_MapManager;

    private get color() {
        return "#71e189";
    }

    private get title() {
        return "FMG Link Copied";
    }

    constructor(popup: MG.Popup, mapManager: FMG_MapManager) {
        this.instance = popup;
        this.mapManager = mapManager;

        this.fixLocationPermaLink();
    }

    private fixLocationPermaLink(): void {
        // Only fix location link if we are on a pro unlocked map.
        if (!new URL(window.location.href).searchParams.has("map")) return;

        const parent = this.instance._content;
        const link = parent.querySelector<HTMLElement>("i.ion-ios-link");
        const fmgLink = link?.cloneNode(true) as HTMLElement | undefined;

        // If we don't have a link or a fmg link, we can't fix it.
        if (!link || !fmgLink) return;

        fmgLink.setAttribute("data-title", this.title);
        fmgLink.style.color = this.color;
        fmgLink.addEventListener("click", () => {
            clipboard(this.createHref(this.instance.locationId));
            this.showPopup(fmgLink);
        });
        link.after(fmgLink);
    }

    /**
     * Creates a fmg map href link
     * @param locationId the location id to link to
     */
    private createHref(locationId: Id): string {
        const url = new URL(window.location.href);
        url.searchParams.set("locationIds", locationId + "");
        return url.toString();
    }

    /**
     * Shows a popup for a link
     * @param link the link to show the popup for
     */
    private showPopup(link: HTMLElement) {
        $(link).tooltip("show");
        setTimeout(() => $(link).tooltip("hide"), 2000);
    }
}
