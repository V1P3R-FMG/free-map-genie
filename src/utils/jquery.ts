import { WaiterTimeoutOptions, waitForCondition } from "./async";

export type JQueryAsync<TElement extends HTMLElement> = Promise<JQuery<TElement>>;

export async function $waitFor<TElement extends HTMLElement = HTMLElement>(
    selector: string,
    options: WaiterTimeoutOptions = {}
) {
    let $this = $<TElement>(selector);
    if ($this.length) return $this;

    await waitForCondition(() => ($this = $<TElement>(selector)) && $this.length > 0, {
        message: `Wait for element with selector ${selector} took to long.`,
        ...options,
    });

    return $this;
}
