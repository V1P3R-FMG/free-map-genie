import { createService } from "@/common/messaging";
import { LoadingOverlay } from "@/contexts/content/ui/LoadingOverlay";
import { Popup } from "@/contexts/content/ui/Popup";

import type { PublicPath } from "wxt/browser";

export interface ExtensionServiceOptions {
  unmountLoadingOverlay: () => void;
}

class ExtensionService {
  private readonly loadingOverlay = new LoadingOverlay({
    message: "FMG Initializing...",
  });

  private readonly popup = new Popup({ open: false });

  public async getURL(path: PublicPath): Promise<string>;
  public async getURL(path: string): Promise<string>;
  public async getURL(path: string): Promise<string> {
    return browser.runtime.getURL(path);
  }

  public mountLoadingOverlay() {
    return this.loadingOverlay.mount();
  }

  public unmountLoadingOverlay() {
    return this.loadingOverlay.unmount();
  }

  public async mountPopup() {
    await this.popup.mount();
  }

  public unmountPopup() {
    return this.popup.unmount();
  }

  public openPopup() {
    return this.popup.update({ open: true });
  }

  public closePopup() {
    return this.popup.update({ open: false });
  }
}

const extensionService = createService({
  context: ExtensionService,
  namespace: "ExtensionService",
  heartbeatTimeout: import.meta.env.SERVICE_TIMEOUT,
});

namespace extensionService {
  export type Instance = createService.User<typeof ExtensionService>;
}

export default extensionService;
