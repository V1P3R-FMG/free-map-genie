import * as object from "@utils/object";
import * as async from "@utils/async";

import mapPage from "@content/pages/map.page";

import gamesService from "@content/services/games.service";
import storeService from "@content/services/store.service";
import storageService from "@content/services/storage.service";

import Key from "@content/storage/key";
import urlService from "./url.service";

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

    public async waitForMapData() {
        await async.waitForCondition(() => !!window.mapData);
        return window.mapData!;
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

    public get hasProCategories() {
        if (!window.mapData) throw "Failed to get info hasProCategories window.mapData not found.";
        return !object.isEmpty(window.mapData.proCategoryLocationCounts);
    }

    public async loadMapData() {
        if (window.mapData) {
            if (window.mapData.heatmapGroups.length) {
                const heatmaps = await gamesService.getHeatmaps(window.mapData.map.id);
                window.mapData.heatmapGroups = heatmaps.groups;
                window.mapData.heatmapCategories = heatmaps.categories;
            }

            const mockMapId = urlService.getMockMapId();
            if (mockMapId || this.hasProCategories) {
                if (window.game) {
                    const mapData = await gamesService.mapData(window.game.id, mockMapId ?? window.mapData.map.id);
                    window.mapData.map = mapData.map;
                    window.mapData.groups = mapData.groups;
                    window.mapData.categories = mapData.categoriesById;
                    window.mapData.locations = mapData.locations;
                    window.mapData.regions = mapData.regions;
                    window.mapData.mapConfig.tile_sets = mapData.config.tile_sets;
                    window.mapData.proCategoryLocationCounts = [];
                } else {
                    logger.warn("Failed to load pro map data window.game not found.");
                }
            }

            window.mapData.maxMarkedLocations = Infinity;
        } else {
            logger.warn("Failed to modify mapData window.mapData not found.");
        }
    }
}

export default new MapService();
