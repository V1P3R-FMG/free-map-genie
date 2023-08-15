const FmgMapSelectorInstalled = Symbol("FmgMapSelectorInstalled");

export interface WindowExtened extends Window {
    [FmgMapSelectorInstalled]?: FMG_MapSelector;
}

export class FMG_MapSelector {
    private window: Window;

    private constructor(window: WindowExtened) {
        this.window = window;
    }

    public static install(window: WindowExtened): FMG_MapSelector {
        if (!window[FmgMapSelectorInstalled]) {
            window[FmgMapSelectorInstalled] = new FMG_MapSelector(window);
        }
        return window[FmgMapSelectorInstalled];
    }

    private static getFreeFirstFreeMapUrl(window: Window): string {
        for (const item of window.document.querySelectorAll(".game-item")) {
            if (!item.classList.contains("unavailable")) {
                return item.getAttribute("href") ?? "";
            }
        }
        throw new Error("No free maps found");
    }

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
                item.removeAttribute("data-togg le");
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

    public static async setup(window: Window): Promise<void> {
        this.unlockProMaps(window);
    }
}
