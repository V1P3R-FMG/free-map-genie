import { Key, Storage } from "@/common/storage";
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

  public async importFromMapgenieAccount(key: Key) {
    if (!this.isLoggedIn()) {
      throw new Error("User is not logged in");
    }

    const user = await this.mapgenie.fetchUser(key.gameId);
    logger.debug("Importing user data from MapGenie account", {
      user,
      key,
    });

    const locations = Object.fromEntries(
      user.locations.map((locId) => [locId, true])
    );
    const trackedCategoryIds = user.tracked_category_ids;
    const notes = user.notes;

    await this.setData(key, {
      locations,
      trackedCategoryIds,
      notes,
      presetOrdering: [],
      presets: [],
    });
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
