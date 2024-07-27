import type PageScript from "./index";

import userService from "@content/services/user.service";
import mapService from "@content/services/map.service";

import mapPage from "@content/pages/map.page";

class MapScript implements PageScript {
    public async initScript() {
        await userService.login();

        mapService.fixGoogleMaps();
        await mapPage.addMapgenieScript();

        this.initButtons();
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
