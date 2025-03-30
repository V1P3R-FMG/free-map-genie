class MapSwitchLink {

    private readonly $link: JQuery<HTMLLinkElement>;
    
    public readonly name: string;
    public readonly premium: boolean;

    public constructor(link: HTMLLinkElement) {
        this.$link = $(link);

        this.name = this.getMapName();
        this.premium = this.isPremium();
    }

    public get href(): string {
        return this.$link.attr("href") ?? "";
    }

    private isPremium() {
        return this.href.endsWith("/upgrade");
    }

    private getMapName() {
        return this.$link
            .text()
            .replace(/\s?\[\w+\]/i, "")
            .replace(" ", "-")
            .toLowerCase();
    }

    public setSelected(selected: boolean) {
        this.$link.toggleClass("selected", selected);
    }

    private fixHref(freeMapLink: MapSwitchLink) {
        const url = new URL(freeMapLink.href);
        url.searchParams.set("map", this.name);
        this.$link.attr("href", url.toString());
    }

    public unlock(freeMapLink: MapSwitchLink) {
        if (!this.premium) return;

        this.fixHref(freeMapLink);

        // Remove style
        this.$link.removeAttr("style");

        // Remove unnecessary attributes
        this.$link.removeAttr("target");
        this.$link.removeAttr("data-toggle");
        this.$link.removeAttr("title");
        this.$link.removeAttr("data-original-title");
        this.$link.removeAttr("data-placement");
    }
}

export default class MapSwitcherPanel {

    private readonly mapLinks: MapSwitchLink[];

    public constructor() {
        this.mapLinks = [...document.querySelectorAll<HTMLLinkElement>(".map-switcher-panel .map-link")]
            .map((link) => new MapSwitchLink(link));
    }

    public selectMap(name: string) {
        this.mapLinks.forEach((link) => link.setSelected(link.name === name));
    }

    public getFreeMapLink() {
        return this.mapLinks.find((link) => !link.premium);
    }

    public unlock() {
        const freeMapLink = this.getFreeMapLink();
        if (!freeMapLink) return;
        
        this.mapLinks.forEach((link) => link.unlock(freeMapLink))
    }

}