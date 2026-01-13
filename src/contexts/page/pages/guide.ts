import { Page } from "./page";
import { Client } from "@/common/client";
import { createAsyncProxy, type AsyncProxy } from "@/common/asyncProxy";
import { activateBlockedMapgenieScript } from "@/common/mapgenie";
import { waitForAxios } from "@/common/axios";
import { waitForProperty } from "@/common/object";
import { waitForDocumentLoaded, waitForElement } from "@/common/dom";

export class GuidePage extends Page {
  private _client?: AsyncProxy<Client>;
  private _userId?: number;

  private async loadUserData() {
    if (!window.user) {
      throw new Error("User or mapData is not available");
    }

    await this.client.migrate();
    const data = await this.client.getData();

    logger.debug("Loaded user data for guide page", data);

    window.foundLocations = data.locations;

    if (this.isTarkovQuest17Page()) {
      window.user.locations = data.locations;
    }
  }

  private isTarkovQuest17Page() {
    return window.location.pathname === "/tarkov/guides/quests-17";
  }

  private async createClient() {
    if (this.isTarkovQuest17Page()) {
      return Client.forGame(20);
    }

    const axios = await waitForAxios();
    const gameId = axios.defaults.headers.common["X-Game-ID"];

    if (gameId) {
      return Client.forGame(Number(gameId));
    }

    return Client.forUrl(window.location.href);
  }

  private get client() {
    return (this._client ??= createAsyncProxy(() => this.createClient()));
  }

  private async getMapWindow() {
    const mapElement = await waitForElement<HTMLIFrameElement>(
      document,
      "#sticky-map iframe"
    );
    const mapWindow = await waitForProperty(mapElement, "contentWindow");
    await waitForProperty(mapWindow!, "mapData");
    return mapWindow;
  }

  private async setupUser() {
    const userId = await this.getUserId();

    window.user = {
      id: userId!,
      hasPro: false,
      locations: {},
      trackedCategoryIds: [],
      role: "user",
      suggestions: [],
    };

    // Mark user as pro to unlock all features in the guide
    window.isPro = true;

    if (this.isTarkovQuest17Page()) {
      window.user!.hasPro = true;
    }
  }

  private async getUserId() {
    if (this._userId !== undefined) {
      return this._userId;
    }

    if (this.isTarkovQuest17Page()) {
      await waitForProperty(window, "config");
      return window.user?.id;
    }

    const mapWindow = await this.getMapWindow();
    return mapWindow?.user?.id;
  }

  private async activateGuideScript() {
    const activateGuideScript = await waitForProperty(
      window,
      "__fmgActivateGuideScript"
    );
    activateGuideScript?.();
  }

  private async resetCheckboxes() {
    await waitForDocumentLoaded();

    // Make sure the guide script checkboxes are unchecked
    $<HTMLInputElement>(".check").each((_, el) => {
      el.checked = false;

      el.onchange = () => {
        console.log("changed", el.dataset.locationId, el.checked);
      };
    });
  }

  private async setupEventListeners() {
    if (this.isTarkovQuest17Page()) {
      return;
    }

    const mapWindow = await this.getMapWindow();
    mapWindow?.addEventListener("locationMarked", (e) => {
      const { detail } = e as CustomEvent<Client.LocationEvent>;

      const $checkbox = $<HTMLInputElement>(
        `.check[data-location-id="${detail.locationId}"]`
      );

      if ($checkbox.length === 0) {
        return;
      }

      $checkbox.prop("checked", detail.found);
    });
  }

  public async start() {
    await this.setupUser();

    await this.client.storageRequestPersist();

    await this.loadUserData();

    await this.resetCheckboxes();

    await this.setupEventListeners();

    await this.activateGuideScript();

    if (this.isTarkovQuest17Page()) {
      await activateBlockedMapgenieScript("TarkovQuestToolWidget");
    }

    await this.client.installInterceptor();
  }

  public async canStart() {
    const userId = await this.getUserId();

    // We can only start if user is logged in
    if (userId === undefined) {
      logger.warn("User not logged in, FMG will not work");

      return false;
    }
    return true;
  }

  public async restore() {
    if (this.isTarkovQuest17Page()) {
      await activateBlockedMapgenieScript("TarkovQuestToolWidget");
    }
  }
}
