import userService from "@content/services/user.service";
import mapService from "@content/services/map.service";
import apiService from "@content/services/api.service";
import storeService from "@content/services/store.service";

import mapPage from "@content/pages/map.page";

class MapScript implements PageScript {
    public async initScript() {
        await userService.login();

        if (window.config) {
            window.config.checklistEnabled = true;
            window.config.presetsEnabled = true;
        } else {
            logger.warn("Failed to modify mapConfig window.config not found.");
        }

        await mapService.waitForMapData();
        await mapService.loadMapData();
        mapPage.unlockProMapsInMapSelectorPanel();

        await userService.load();

        mapService.fixGoogleMaps();
        await mapPage.addMapgenieScript();

        if (window.user) {
            await storeService.install();
            await apiService.install();
        }

        await mapPage.initButtons();
    }
}

export default new MapScript();
