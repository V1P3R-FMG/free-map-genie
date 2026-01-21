import type { WindowOptions } from "./types";

export class WindowHandle {
  constructor(public id: number) {}

  public static async open(url: string, options?: WindowOptions) {
    const window = await browser.windows.create({
      url,
      type: "popup",
      ...options,
    });

    if (window?.id === undefined) {
      throw new Error("Failed to create window");
    }

    return new WindowHandle(window.id);
  }

  public async focus() {
    await browser.windows.update(this.id, { focused: true });
  }

  public async close() {
    await browser.windows.remove(this.id);
  }

  public onClosed(callback: () => void) {
    const listener = (windowId: number) => {
      if (windowId === this.id) {
        callback();
        browser.windows.onRemoved.removeListener(listener);
      }
    };
    browser.windows.onRemoved.addListener(listener);
  }
}
