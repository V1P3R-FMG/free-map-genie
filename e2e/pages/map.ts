import { AxiosPage } from "./axios";

export class MapPage extends AxiosPage {
  public async open(url: string) {
    await this.page.goto(url);
  }

  public async openMap(gameSlug: string, mapSlug: string) {
    await this.page.goto(
      "https://mapgenie.io/" + gameSlug + "/maps/" + mapSlug
    );
  }

  public async openTarkovFactoryMap() {
    await this.openMap("tarkov", "factory");
  }

  public async openRedDeadRedemption2Map() {
    await this.open("https://rdr2map.com/");
  }
}
