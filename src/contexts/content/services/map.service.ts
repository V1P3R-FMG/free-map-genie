import * as object from "@utils/object";
import * as async from "@utils/async";

import mapPage from "@content/pages/map.page";

import gamesService from "@content/services/games.service";
import storeService from "@content/services/store.service";
import storageService from "@content/services/storage.service";
import urlService from "./url.service";

import Key from "@content/storage/key";
import type { LatestData } from "@content/storage/data/index";

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

    public async load(old?: LatestData) {
        const data = await storageService.load(Key.fromWindow(window));

        if (old) {
            for (const id in old.locations) {
                if (!data.locations.has(id)) this.markLocation(id, false);
            }
            for (const id in data.locations) {
                if (!old.locations.has(id)) this.markLocation(id, true);
            }
        } else {
            for (const location of storeService.mapState.locations) {
                this.markLocation(location.id, data.locations.has(location.id));
            }
        }
        this.updateFoundLocations();

        if (old) {
            for (const id in old.categories) {
                if (!data.categories.has(id)) this.trackCategory(Number(id), false);
            }
            for (const id in data.categories) {
                if (!old.categories.has(id)) this.trackCategory(Number(id), true);
            }
        } else {
            for (const id of storeService.mapState.categoryIds) {
                this.trackCategory(Number(id), data.categories.has(id));
            }
        }
    }

    public async waitForMapData() {
        await async.waitForCondition(() => !!window.mapData);
        return window.mapData!;
    }

    public get hasCircleLocationMarkers() {
        if (!window.map) throw "Failed to get info hasCircleLocationMarkers, window.map not found.";
        return window.map.getSource("circle-locations-data")._data.features.length > 0;
    }

    public markLocation(id: number | string, marked: boolean) {
        if (!window.game) throw "Failed to mark location, window.game not found.";
        if (!window.map) throw "Failed to mark location, window.map not found.";

        window.map.setFeatureState({ source: "locations-data", id }, { found: marked });
        if (this.hasCircleLocationMarkers)
            window.map.setFeatureState({ source: "circle-locations-data", id }, { found: marked });
    }

    public updateFoundLocations() {
        if (!window.mapManager) throw "Failed to mark location, window.mapManager not found.";

        if (window.mapManager.showFoundLocations) {
            window.mapManager.updateFoundLocationsStyle();
        }
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

    public findFreeMapUrl() {
        let lockedMaps = 0;
        for (const link of mapPage.mapLinks) {
            if (link.href.endsWith("/upgrade")) {
                lockedMaps++;
            } else if (!link.href.endsWith("/upgrade")) {
                return link.href;
            }
        }
        if (lockedMaps > 0) {
            logger.warn("No free maps found could not unlock maps in map switcher panel");
        }
        return null;
    }

    public getMapNameFromLabel(label: string) {
        return label.replace(/\s?\[\w+\]/i, "");
    }

    public getMapFromName(name: string) {
        if (!window.mapData) throw `Failed to get map slug for map ${name}, window.mapData not found.`;
        return window.mapData.maps.find((map) => map.title === name);
    }

    public getMapFromSlug(slug: string) {
        if (!window.mapData) throw `Failed to get map slug for map slug ${slug}, window.mapData not found.`;
        return window.mapData.maps.find((m) => m.slug === slug.toLowerCase());
    }

    public async loadMapData() {
        if (window.mapData) {
            if (window.mapData.heatmapGroups.length) {
                const heatmaps = await gamesService.getHeatmaps(window.mapData.map.id);
                window.mapData.heatmapGroups = heatmaps.groups;
                window.mapData.heatmapCategories = heatmaps.categories;
            }

            const mockMap = urlService.getMockMap();
            if (mockMap || this.hasProCategories) {
                if (window.game) {
                    const mapData = await gamesService.mapData(window.game.id, mockMap?.id ?? window.mapData.map.id);
                    window.mapData.map = mapData.map;
                    window.mapData.groups = mapData.groups;
                    window.mapData.categories = mapData.categoriesById;
                    window.mapData.locations = mapData.locations;
                    window.mapData.regions = mapData.regions;
                    window.mapData.mapConfig.tile_sets = mapData.config.tile_sets;
                    window.mapData.proCategoryLocationCounts = [];
                } else {
                    logger.warn("Failed to load pro map data, window.game not found.");
                }
            }

            window.mapData.maxMarkedLocations = Infinity;
        } else {
            logger.warn("Failed to modify mapData, window.mapData not found.");
        }
    }
}

export default new MapService();
