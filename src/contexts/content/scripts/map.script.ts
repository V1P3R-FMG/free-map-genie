import userService from "@content/services/user.service";
import mapService from "@content/services/map.service";
import apiService from "@content/services/api.service";
import storeService from "@content/services/store.service";
import pageService from "@content/services/page.service";
import storageService from "@content/services/storage.service";

import mapPage from "@content/pages/map.page";

import Key from "@content/storage/key";

class MapScript implements PageScript {
    public async initScript() {
        await userService.login();

        if (window.config) {
            window.config.checklistEnabled = true;
            window.config.presetsEnabled = true;
            window.config.iconSizeToggleEnabled = true;
        } else {
            logger.warn("Failed to modify mapConfig window.config not found.");
        }

        await storageService.installFilter();

        await mapService.waitForMapData();
        await mapService.loadMapData();
        mapPage.unlockProMapsInMapSelectorPanel();

        await userService.load();

        mapService.fixGoogleMaps();
        await mapPage.addMapgenieScript();

        if (window.user) {
            await storeService.install();
            await apiService.installFilter();
        }

        await mapPage.initButtons();

        pageService.onreload = async () => {
            const key = Key.fromWindow(window);
            const cur = storageService.loadFromCache(key);
            const hasData = await storageService.has(key);

            storageService.removeFromCache(key);
            const data = await storageService.load(key);

            if (!cur || !hasData || cur.latestUpdate < data.latestUpdate) {
                await mapService.load(cur);
            }
        };
    }
}

export default new MapScript();
