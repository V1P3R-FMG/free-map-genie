import mapPage from "@content/pages/map.page";

import storeService from "@content/services/store.service";
import storageService from "@content/services/storage.service";

import Key from "@content/storage/key";

class MapService {
    public fixGoogleMaps() {
        if (window.config?.altMapSdk) {
            window.google ??= {};
            window.google.maps ??= { Size: function () {} };
        }
    }

    public async getMapSrc() {
        const script = await mapPage.mapgenieScript;
        return script.remove().attr("src")!;
    }

    public async load() {
        const data = await storageService.load(Key.fromWindow(window));

        for (const id in data.locations) {
            this.markLocation(Number(id), true);
        }

        for (const id in data.categories) {
            this.trackCategory(Number(id), true);
        }
    }

    public markLocation(id: number, marked: boolean) {
        window.mapManager?.setLocationFound(id, marked);
    }

    public trackCategory(id: number, tracked: boolean) {
        storeService.dispatch({
            type: tracked ? "MG:USER:ADD_TRACKED_CATEGORY" : "MG:USER:REMOVE_TRACKED_CATEGORY",
            meta: {
                categoryId: id,
            },
        });
    }
}

export default new MapService();
