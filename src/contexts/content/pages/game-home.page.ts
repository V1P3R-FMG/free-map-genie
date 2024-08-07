import { $waitFor } from "@utils/jquery";

class GameHomePage {
    public get mapContainer() {
        return $waitFor(".maps-container");
    }

    public get gameCards() {
        return $<HTMLAnchorElement>(".game-item");
    }
}

export default new GameHomePage();
