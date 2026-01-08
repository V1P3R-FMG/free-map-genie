import { AxiosPage } from "./axios";

export class MapPage extends AxiosPage {
  public async open(gameSlug: string, mapSlug: string) {
    await this.page.goto(
      "https://mapgenie.io/" + gameSlug + "/maps/" + mapSlug
    );
  }
}
