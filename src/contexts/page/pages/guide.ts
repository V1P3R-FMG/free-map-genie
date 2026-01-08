import { Page } from "./page";
import { Client } from "@/common/client";
import { createAsyncProxy, type AsyncProxy } from "@/common/asyncProxy";
import { activateBlockedMapgenieScript, makeUserPro } from "@/common/mapgenie";

export class GuidePage extends Page {
  private _client?: AsyncProxy<Client>;

  private async loadUserData() {
    if (!window.user) {
      throw new Error("User or mapData is not available");
    }

    const data = await this.client.getData();

    logger.debug("Loaded user data for guide page", data);

    window.user!.locations = data.locations;
  }

  private isTarkovQuest17Page() {
    return window.location.pathname === "/tarkov/guides/quests-17";
  }

  private get client() {
    return (this._client ??= createAsyncProxy(() =>
      Client.forUrl(window.location.href)
    ));
  }

  public async start() {
    await this.client.storageRequestPersist();

    makeUserPro();

    await this.loadUserData();

    if (this.isTarkovQuest17Page()) {
      await activateBlockedMapgenieScript("TarkovQuestToolWidget");
    }
    await this.client.installInterceptor();
  }

  public async canStart() {
    // We can only start if user and mapData are present
    if (!window.user) {
      if (this.isTarkovQuest17Page()) {
        await activateBlockedMapgenieScript("TarkovQuestToolWidget");
      }

      logger.warn("User not logged in, FMG will not work");

      return false;
    }
    return true;
  }
}
