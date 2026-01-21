import { Storage } from "@/common/storage";
import { createService, type ProxiedObject } from "@/common/messaging";

class BackendService extends Storage {
  public async getAuthToken(): Promise<string | null> {
    const authToken = document.head.querySelector<HTMLMetaElement>(
      'meta[name="auth-token"]'
    );
    return authToken?.content || null;
  }

  public async isLoggedIn(): Promise<boolean> {
    const authToken = await this.getAuthToken();
    return !!authToken;
  }
}

const backendService = createService({
  context: BackendService,
  namespace: "BackendService",
  heartbeatTimeout: import.meta.env.SERVICE_TIMEOUT,
});

namespace backendService {
  export type Instance = ProxiedObject<BackendService>;
}

export default backendService;
