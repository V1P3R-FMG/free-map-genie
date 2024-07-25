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
        return Promise.waitFor<Window>(
            (resolve) => this.contentWindow && resolve(this.contentWindow)
        ).timeout(timeout ?? 5000);
    };
}


export {};
