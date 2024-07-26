declare global {
    interface HTMLIFrameElement {
        waitForContentWindow(timeout?: number): Promise<Window>;
    }
}

if (global.HTMLIFrameElement) {
    HTMLIFrameElement.prototype.waitForContentWindow = function (
        this: HTMLIFrameElement,
        timeout?: number
    ): Promise<Window> {
        return Promise.waitFor<Window>((resolve) => this.contentWindow && resolve(this.contentWindow), {
            timeout,
            message: "Wait for iframe contentWindow took to long.",
        });
    };
}

export {};
