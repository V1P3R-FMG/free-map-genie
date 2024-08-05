import userService from "@content/services/user.service";
import mapService from "@content/services/map.service";
import apiService from "@content/services/api.service";
import storeService from "@content/services/store.service";

import mapPage from "@content/pages/map.page";

class MapScript implements PageScript {
    public async initScript() {
        await userService.login();
        await userService.load();

        if (window.config) {
            window.config.checklistEnabled = true;
            window.config.presetsEnabled = true;
        } else {
            logger.warn("Failed to modify mapConfig window.config not found.");
        }

        mapService.fixGoogleMaps();
        await mapPage.addMapgenieScript();

        if (window.user) {
            await storeService.install();
            await apiService.install();
        }

        await this.initButtons();
    }

    public async initButtons() {
        if (await userService.isLoggedIn()) {
            await mapPage.initLogoutButton();
        } else {
            await mapPage.initLoginButton();
            mapPage.addMockUserButton();
        }
    }
}

export default new MapScript();
