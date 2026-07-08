import { WindowHandle } from "./handle";

import type { WindowOptions } from "./types";

export class WindowManager {
  private handles: Map<string, WindowHandle> = new Map();

  public async open(url: string, options?: WindowOptions) {
    let handle = this.handles.get(url);
    if (handle) {
      await handle.focus();
      return;
    }

    handle = await WindowHandle.open(url, options);

    handle.onClosed(() => {
      this.handles.delete(url);
    });

    this.handles.set(url, handle);
  }

  public async close(url: string) {
    const handle = this.handles.get(url);
    if (handle) {
      await handle.close();
    }
  }
}
