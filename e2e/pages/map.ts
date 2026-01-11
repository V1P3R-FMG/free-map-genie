import { AxiosPage } from "./axios";

import type { Page } from "@playwright/test";

type GotoOptions = Parameters<Page["goto"]>[1];

export class MapPage extends AxiosPage {
  public async gotoTarkovFactoryMap(options?: GotoOptions) {
    await this.page.goto("https://mapgenie.io/tarkov/maps/factory", options);
  }

  public async gotoRedDeadRedemption2Map(options?: GotoOptions) {
    await this.page.goto("https://rdr2map.com/", options);
  }

  public async waitForUser() {
    return this.page.waitForFunction("!!window.user");
  }

  public async getGameId() {
    return this.page.evaluate(() => window.game!.id);
  }

  public async getUserId() {
    return this.page.evaluate(() => window.user!.id);
  }

  public async forceUserId(userId: number) {
    // Override user ID to always be 0 for consistent testing
    await this.page.addInitScript((id) => {
      const user = { id };

      Object.defineProperty(window, "user", {
        get: () => user,
        set: (newUser) => {
          Object.assign(user, { ...newUser, id });
        },
        configurable: true,
      });
    }, userId);
  }
}
