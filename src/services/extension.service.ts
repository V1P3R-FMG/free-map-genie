import { createService } from "@/common/messaging";
import { PublicPath } from "wxt/browser";

export interface ExtensionServiceOptions {
  unmountLoadingOverlay: () => void;
}

class ExtensionService {
  private readonly _unmountLoadingOverlay: () => void;

  constructor({ unmountLoadingOverlay }: ExtensionServiceOptions) {
    this._unmountLoadingOverlay = unmountLoadingOverlay;
  }

  public async getURL(path: PublicPath): Promise<string>;
  public async getURL(path: string): Promise<string>;
  public async getURL(path: string): Promise<string> {
    return browser.runtime.getURL(path);
  }

  public unmountLoadingOverlay() {
    this._unmountLoadingOverlay();
  }
}

const extensionService = createService({
  context: ExtensionService,
  namespace: "ExtensionService",
  heartbeatTimeout: import.meta.env.SERVICE_TIMEOUT,
});

export namespace extensionService {
  export type Instance = createService.User<typeof ExtensionService>;
}

export default extensionService;
