import { JSDOM, VirtualConsole, type DOMWindow } from "jsdom";

export class IFrameMock {
    private _src: string | undefined;
    private onload: Callback<void, []> | undefined;
    public contentWindow: DOMWindow | undefined;
    public style = {};
    private globals: Record<string, any> = {};

    constructor(globals: Record<string, any> = {}) {
        this.globals = globals;
    }

    public set src(source: string | undefined) {
        this.remove();
        this._src = source;
        if (this._src) this.load();
    }

    public addEventListener(event: "load", callback: Callback<void, []>) {
        if (event === "load") {
            this.onload = callback;
        }
    }

    private async load() {
        if (!this._src) throw new Error("No src set");
        const dom = await JSDOM.fromURL(this._src, {
            runScripts: "dangerously",
            virtualConsole: new VirtualConsole()
        });
        this.contentWindow = dom.window;
        if (this.onload) this.onload();
    }

    public remove() {
        this.contentWindow = undefined;
    }
}

export function attachWindow(
    window: DOMWindow,
    globals: Record<string, any> = {}
) {
    const createEelement = window.document.createElement.bind(window.document);
    const appendChild = window.document.body.appendChild.bind(
        window.document.body
    );

    window.document.createElement = function (tagName: string) {
        const element = createEelement(tagName);
        if (tagName === "iframe") {
            return new IFrameMock(globals);
        }
        return element;
    } as typeof window.document.createElement;

    window.document.body.appendChild = function (
        element: HTMLElement | IFrameMock
    ) {
        if (element instanceof IFrameMock) return;
        return appendChild(element);
    } as typeof window.document.body.appendChild;

    window.document.body.append = function (...elements: HTMLElement[]) {
        return elements.forEach((element) => {
            window.document.body.appendChild(element);
        });
    };
}
