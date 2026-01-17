import { createService } from "@/common/messaging";
import { PublicPath } from "wxt/browser";

class ExtensionService {
  public async getURL(path: PublicPath): Promise<string>;
  public async getURL(path: string): Promise<string>;
  public async getURL(path: string): Promise<string> {
    return browser.runtime.getURL(path);
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
