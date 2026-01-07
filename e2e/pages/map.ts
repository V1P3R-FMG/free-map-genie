import type { Page } from "@playwright/test";

export class MapPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  public async open(gameSlug: string, mapSlug: string) {
    await this.page.goto(
      "https://mapgenie.io/" + gameSlug + "/maps/" + mapSlug
    );
  }
}
