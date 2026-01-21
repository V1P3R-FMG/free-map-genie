import { Storage } from "@/common/storage";
import { createService, type ProxiedObject } from "@/common/messaging";
import { getAuthToken, setAuthToken } from "@/common/mapgenie";

import mapgenieService from "./mapgenie.service";

class BackendService extends Storage {
  private readonly mapgenie = mapgenieService.use();

  public getAuthToken() {
    return getAuthToken();
  }

  public setAuthToken(token: string | null) {
    setAuthToken(token);
  }

  public async updateUser() {
    const user = await this.getUserProfile();

    if (!this.isLoggedIn()) {
      if (user) {
        await this.removeProfile(user.id);
      }
      return;
    }

    const userData = await this.mapgenie.fetchUser(1);
    const idMatches = user?.id === userData.id;
    const nameMatches = user?.name === userData.username;

    if (!user || !idMatches || !nameMatches) {
      await this.addUserProfile(userData.id, userData.username);
    }
  }

  public isLoggedIn() {
    const authToken = this.getAuthToken();
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
