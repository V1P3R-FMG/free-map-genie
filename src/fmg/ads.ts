import { getElement } from "@shared/dom";

class AdElementSelector {
    private readonly selector: string;
    private readonly parent: boolean;
    private readonly window: Window;

    public constructor(selector: string, parent: boolean, window: Window) {
        this.selector = selector;
        this.parent = parent;
        this.window = window;
    }

    public async remove() {
        try {
            const element = await getElement(this.selector, this.window, 5000);
            if (this.parent) {
                element.parentElement?.remove();
            } else {
                element.remove();
            }
        } catch {
            logger.warn("Failed to remove ad with selector", this.selector);
        }
    }
}

export default class AdsRemover {

    private readonly window: Window;
    private readonly selectors: AdElementSelector[];

    public constructor(window?: Window) {
        this.window = window ?? global.window;
        this.selectors = [];
    }

    public registerSelector(selector: string, parent?: boolean) {
        this.selectors.push(new AdElementSelector(selector, parent ?? false, this.window));
    }

    public removeElements() {
        this.selectors.forEach((selector) => selector.remove());
    }

}