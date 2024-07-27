import { waitForCondition } from "@utils/async";

import mapPage from "@content/pages/map.page";

class MapService {
    public fixGoogleMaps() {
        if (window.config?.altMapSdk) {
            window.google ??= {};
            window.google.maps ??= { Size: function () {} };
        }
    }

    public async getStore() {
        await waitForCondition(() => !!window.store, { message: "Wait for window.store took to long." });
        return window.store;
    }

    public async getMapSrc() {
        const script = await mapPage.mapgenieScript;
        return script.remove().attr("src")!;
    }
}

export default new MapService();
