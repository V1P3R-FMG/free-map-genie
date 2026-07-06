import { Page } from "../page";

import { Client } from "@/common/client";
import { activateBlockedMapgenieScript } from "@/common/mapgenie";
import { waitForProperty } from "@/common/object";
import { waitForElement } from "@/common/dom";

import { GuideState } from "./state";

export class GuidePage extends Page {
  private readonly isTarkovQuest17Page =
    window.location.pathname === "/tarkov/guides/quests-17";

  private readonly state = new GuideState();

  private readonly client = new Client();

  private async loadUserData() {
    if (!window.user) {
      throw new Error("User or mapData is not available");
    }

    await this.client.migrate();
    const data = await this.client.getData();

    window.foundLocations = data.locations;
    window.user.locations = data.locations;

    const state = await this.state.waitForState();
    this.state.resetState();

    // Update state found locations
    state.foundLocations = data.locations;
  }

  private async getMapElement() {
    return waitForElement<HTMLIFrameElement>(document, "#sticky-map iframe");
  }

  private async getMapWindow() {
    const mapElement = await this.getMapElement();
    const mapWindow = await waitForProperty(mapElement, "contentWindow");
    await waitForProperty(mapWindow!, "mapData");
    return mapWindow;
  }

  private async setupUser(userId?: number) {
    if (userId === undefined) return;

    // Get the active user from the backend
    const activeUserId = await this.client.getActiveUserId();

    // Client requires a user to object to function properly
    // So we create a dummy user
    window.user = {
      id: activeUserId ?? userId,
      realId: userId,
      hasPro: false,
      locations: {},
      trackedCategoryIds: [],
      role: "user",
      suggestions: [],
    };

    // Mark user as pro to unlock all features in the guide
    window.isPro = true;
    window.user!.hasPro = true;
  }

  private async getUserId() {
    if (this.isTarkovQuest17Page) {
      await waitForProperty(window, "config");
      return window.user?.id;
    }

    const mapWindow = await this.getMapWindow();
    return mapWindow?.user?.id;
  }

  private fixCheckbox(checkbox: HTMLInputElement) {
    const $this = $(checkbox);

    const locationId = $this.data("location-id");

    if (!locationId) {
      logger.warn("Checkbox has no data-location-id attribute");
      return;
    }

    const isFound = window.foundLocations![locationId] ?? false;

    // Update the checkbox state
    $this.prop("checked", isFound);

    // Update the checklist item row state if applicable
    const $td = $this.parent();
    const $tr = $td?.parent();

    if ($tr && $tr.is(".checklist-item")) {
      $tr.toggleClass("found", isFound);
    }
  }

  private fixState(checkbox: HTMLInputElement) {
    const $this = $(checkbox);
    const locationId = $this.data("location-id");

    if (!locationId) {
      logger.warn("Checkbox has no data-location-id attribute");
      return;
    }

    this.state.fixStateForLocationId(checkbox, locationId);
  }

  private fixCheckboxes() {
    // Make sure the guide script checkboxes are unchecked
    $<HTMLInputElement>(".check").each((_, checkbox) => {
      this.fixCheckbox(checkbox);
      this.fixState(checkbox);
    });

    this.state.updateCounts();
  }

  private async setupEventListeners() {
    if (this.isTarkovQuest17Page) {
      return;
    }

    const setupLocationMarkedListener = async () => {
      const mapWindow = await this.getMapWindow();
      mapWindow?.addEventListener("locationMarked", (e) => {
        const { locationId, found } = e.detail;

        this.state.markLocationFound(locationId, found);
      });
    };

    await setupLocationMarkedListener();

    const mapElement = await this.getMapElement();
    mapElement.addEventListener("load", async () => {
      await setupLocationMarkedListener();
    });
  }

  public async start() {
    const userId = await this.getUserId();

    await this.setupUser(userId);

    if (userId === undefined) {
      if (this.isTarkovQuest17Page) {
        await activateBlockedMapgenieScript("TarkovQuestToolWidget");
      }
      return;
    }

    // Request persistend storage
    await this.client.storageRequestPersist();

    // Login client from guide data
    await this.client.loginFromGuide();

    // Load user data
    await this.loadUserData();

    this.fixCheckboxes();

    // Activate blocked Mapgenie scripts
    if (this.isTarkovQuest17Page) {
      await activateBlockedMapgenieScript("TarkovQuestToolWidget");
    }

    await this.setupEventListeners();
    await this.client.installInterceptor();
  }

  public async info(): Promise<Record<string, any>> {
    const userId = await this.getUserId();

    if (this.isTarkovQuest17Page) {
      return {
        userId: userId ?? "not logged in",
        game: "Tarkov",
        gameId: 20,
      };
    }

    const mapWindow = await this.getMapWindow();
    const gameId = mapWindow?.game?.id ?? null;
    const game = mapWindow?.game?.title ?? null;

    return {
      userId: userId ?? "not logged in",
      game,
      gameId: gameId,
    };
  }
}
