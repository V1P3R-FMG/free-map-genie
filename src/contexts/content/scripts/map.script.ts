import userService from "@content/services/user.service";
import mapService from "@content/services/map.service";

import mapPage from "@content/pages/map.page";

import ApiFilter from "@fmg/filters/api-filter";

class MapScript implements PageScript {
    public async initScript() {
        await userService.login();

        mapService.fixGoogleMaps();
        await mapPage.addMapgenieScript();

        const filter = await ApiFilter.install(window);

        filter.registerFilter("put", { path: "locations", hasId: true }, ({ id }) => {
            logger.log("id", id);
            return { block: true };
        });

        filter.registerFilter("delete", { path: "locations", hasId: true }, ({ id }) => {
            logger.log("id", id);
            return { block: true };
        });

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
