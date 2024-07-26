import { WaiterTimeoutOptions } from "./async";

declare global {
    type JQueryAsync<TElement extends HTMLElement> = Promise<JQuery<TElement>>;

    interface JQueryStatic {
        /**
         * Waits for an element to exist before resolving.
         */
        waitFor<TElement extends HTMLElement = HTMLElement>(
            selector: string,
            options?: WaiterTimeoutOptions
        ): Promise<JQuery<TElement>>;
    }
}

$.waitFor = async function <TElement extends HTMLElement = HTMLElement>(
    selector: string,
    options: WaiterTimeoutOptions = {}
): JQueryAsync<TElement> {
    const $this = $<TElement>(selector);
    if ($this.length) return $this;

    return await Promise.waitFor<JQuery<TElement>>(
        (resolve) => {
            const $this = $<TElement>(selector);
            if ($this.length) resolve($this);
        },
        {
            message: `Wait for element with selector ${selector} took to long.`,
            ...options,
        }
    );
};

export {};
