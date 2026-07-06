import { Page } from "./page";

import { fixGameHomeLinks } from "@/common/mapgenie";

import mapgenieService from "@/services/mapgenie.service";

export class GameHomePage extends Page {
  private readonly mapgenie = mapgenieService.use();

  public async unlockProMaps() {
    await fixGameHomeLinks(this.mapgenie);
  }

  public async start() {
    await this.unlockProMaps();
  }

  public async info(): Promise<Record<string, any>> {
    return {};
  }
}
