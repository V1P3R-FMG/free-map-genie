import gameHomePage from "@content/pages/game-home.page";
import gameHomeService from "@content/services/game-home.service";

class GameHomeScript implements PageScript {
    public async initScript() {
        await gameHomePage.mapContainer;
        await gameHomeService.unlockProMaps();
    }
}

export default new GameHomeScript();
