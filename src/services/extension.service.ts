import { createService } from "@/common/messaging";
import { LoadingOverlay } from "@/contexts/content/ui/LoadingOverlay";
import { PublicPath } from "wxt/browser";

export interface ExtensionServiceOptions {
  unmountLoadingOverlay: () => void;
}

class ExtensionService {
  private readonly loadingOverlay = new LoadingOverlay({
    message: "FMG Initializing...",
  });

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
