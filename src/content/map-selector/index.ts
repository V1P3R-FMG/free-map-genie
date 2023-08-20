const FmgMapSelectorInstalled = Symbol("FmgMapSelectorInstalled");

export interface WindowExtened extends Window {
    [FmgMapSelectorInstalled]?: FMG_MapSelector;
}

export class FMG_MapSelector {
    private window: Window;

    private constructor(window: WindowExtened) {
        this.window = window;
    }

    /**
     * Installs the map selector in the window.
     * Will only install once.
     * @param window the window to install the map selector in
     * @returns the installed map selector
     */
    public static install(window: WindowExtened): FMG_MapSelector {
        if (!window[FmgMapSelectorInstalled]) {
            window[FmgMapSelectorInstalled] = new FMG_MapSelector(window);
        }
        return window[FmgMapSelectorInstalled];
    }

    /**
     * Searches for a map that is free and returns the url.
     * @param window the window to search in
     * @returns the url of the first free map
     * @throws if no free map is found
     */
    private static getFreeFirstFreeMapUrl(window: Window): string {
        for (const item of window.document.querySelectorAll(".game-item")) {
            if (!item.classList.contains("unavailable")) {
                return item.getAttribute("href") ?? "";
            }
        }
        throw new Error("No free maps found");
    }

    /**
     * Get the map name from the item.
     * @param item the item to get the map name from
     * @returns the map name
     * @throws if the map name could not be found
     */
    private static getMapName(item: Element): string {
        const img = item.querySelector<HTMLImageElement>("img");
        if (img?.alt) {
            return img.alt.toLowerCase();
        } else if (img?.src) {
            const name = /\/maps\/([\w_-]+)\.[\w]+/.exec(img.src)?.[1];
            if (name) {
                return name.toLowerCase();
            }
        }
        throw new Error("Could not find map name");
    }

    /**
     * Unlocks all maps locked behind pro paywall.
     * @param window the window to unlock the maps in
     * @throws if no free map is found or the map name could not be found for a specific map
     */
    private static unlockProMaps(window: Window): void {
        const freeMapUrl = this.getFreeFirstFreeMapUrl(window);
        window.document.querySelectorAll(".game-item").forEach((item) => {
            if (item.classList.contains("unavailable")) {
                // Remove the unavailable class
                item.classList.remove("unavailable");

                // Fix the href
                const url = new URL(freeMapUrl);
                url.searchParams.set("map", this.getMapName(item));
                item.setAttribute("href", url.toString());

                // Remove the unnecessary attributes
                item.removeAttribute("target");
                item.removeAttribute("data-toggle");
                item.removeAttribute("title");
                item.removeAttribute("data-placement");
                item.removeAttribute("data-original-title");

                // Remove the text [PRO] from the title
                const title =
                    item.querySelector<HTMLHeadingElement>(".card-title");
                if (title)
                    title.innerText = title.innerText.replace(/\s\[PRO\]/i, "");
            }
        });
    }

    /**
     * Sets up the map selector.
     * @param window the window to setup the map selector in
     */
    public static async setup(window: Window): Promise<void> {
        this.unlockProMaps(window);
    }
}
