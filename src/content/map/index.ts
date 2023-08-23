import { createScript, getElement } from "@shared/dom";
import { timeout, waitForGlobals } from "@shared/async";

import { FMG_ApiFilter } from "@fmg/filters/api-filter";
import { FMG_StorageFilter } from "@fmg/filters/storage-filter";
import { FMG_MapData } from "@fmg/info/map-data";
import { FMG_ExtensionData } from "@fmg/extension-data";
import { FMG_MapManager } from "../../fmg/map-manager";
import { FMG_Storage } from "@fmg/storage";
import { FMG_UI } from "./ui";

import setupMapApiFilter from "./filters/api-filter";
import setupMapStorageFilter from "./filters/storage-filter";

export const FmgMapInstalled = Symbol("FmgMapInstalled");

export type FmgMapWindow = Window & { [FmgMapInstalled]?: FMG_Map };

/**
 * The fmg map script
 * Handles all map related functionality
 */
export class FMG_Map {
    /*
     * Because we delayed the map script, we need to manually create the google maps object.
     * If altMapSdk is enabled.
     * Because google.maps will allready be defined by another script,
     * and there for the map script will never define a maps mock object.
     **/
    private static fixGoogleMaps(window: Window): void {
        if (window.config?.altMapSdk) {
            window.google = window.google || {};
            window.google.maps = {
                Size: function () {}
            };
        }
    }

    /**
     * Load mock user if enabled.
     * And fill in data from storage.
     * @param window the window to load the user in
     */
    private static loadUser(mapManager: FMG_MapManager) {
        if (window.user) {
            window.user.trackedCategoryIds =
                mapManager.storage.data.categoryIds;
            window.user.suggestions = [];
            window.user.hasPro = true;
            window.user.locations = mapManager.storage.data.locations;
            window.user.gameLocationsCount =
                mapManager.storage.data.locationIds.length;
            window.user.presets = mapManager.storage.data.presets;
        }
        if (window.mapData) {
            window.mapData.notes = mapManager.storage.data.notes;
        }
    }

    /**
     * Enable map editor.
     * At the momment nothing usfull can be done with as far as i know.
     */
    private static enableEditor(window: Window) {
        window.isEditor = true;
        if (window.user) window.user.role = "admin";
    }

    /**
     * Load map data, from url params.
     * @param window the window to load the map data in
     */
    private static async loadMapData(window: Window) {
        const params = new URL(window.location.href).searchParams;
        const map = params.get("map");
        const mapId = map
            ? window.mapData?.maps.find((m) => m.slug == map)?.id ?? null
            : null;

        if (map && !mapId) {
            logger.error(
                `Map(${map}) not found, valid maps: `,
                window.mapData?.maps.map((map) => map.slug) || []
            );
            throw new Error("Map not found");
        }

        if (!map || !mapId) return;

        if (window.mapData) {
            const mapData = await FMG_MapData.get(mapId);

            // Urls
            window.mapUrl = mapData.url;
            window.baseUrl = mapData.gameConfig.url;
            window.cdnUrl = mapData.gameConfig.cdn_url;
            window.tilesCdnUrl = mapData.gameConfig.tiles_base_url;
            // window.storageCdnUrl = ?; // We can assume this is always the same?

            // Map Data
            window.mapData.map = mapData.map;
            window.mapData.groups = mapData.groups;
            window.mapData.categories = mapData.categories;
            window.mapData.locations = mapData.locations;
            window.mapData.regions = mapData.regions;

            // Map Settings
            window.mapData.mapConfig = mapData.mapConfig;
            window.initialZoom = mapData.mapConfig.initial_zoom;
            window.initiaPosition = {
                lat: mapData.mapConfig.start_lat,
                lng: mapData.mapConfig.start_lng
            };
            return;
        }

        throw new Error("Map data not found");
    }

    /**
     * Enable pro features
     */
    private static async setupConfig(window: Window) {
        // Set configurations enabled.
        if (window.config) {
            if (FMG_ExtensionData.settings.presets_allways_enabled) {
                window.config.presetsEnabled = true;
            }
        }
    }

    /**
     * Find the first free map url in the map switcher panel.
     * @param window the window to search in
     * @returns the first free map url
     */
    private static getFreeMapUrl(window: Window): string | null {
        let lockedMaps = 0;
        for (const link of window.document.querySelectorAll<HTMLLinkElement>(
            ".map-switcher-panel .map-link"
        )) {
            if (!link.href) continue;
            else if (link.href.endsWith("/upgrade")) {
                lockedMaps++;
            } else if (!link.href.endsWith("/upgrade")) {
                return link.href;
            }
        }
        if (lockedMaps > 0) {
            logger.warn(
                "No free maps found could not unlock maps in map switcher panel"
            );
        }
        return null;
    }

    /**
     * Get the map name for a given link element.
     */
    private static getMapName(link: HTMLLinkElement): string {
        return link.innerText.replace(/\s?\[\w+\]/i, "").toLowerCase();
    }

    /**
     * Unlock maps in map switcher panel.
     */
    private static unlockMaps(window: Window) {
        if (!window.document.querySelector(".map-switcher-panel")) return;

        const map = new URL(window.location.href).searchParams.get("map");

        const freeMapUrl = FMG_Map.getFreeMapUrl(window);
        if (!freeMapUrl) return;
        window.document
            .querySelectorAll<HTMLLinkElement>(".map-switcher-panel .map-link")
            .forEach((link) => {
                const mapName = FMG_Map.getMapName(link);

                // Fix selected when on a pro unlocked map
                if (map) {
                    if (mapName !== map) {
                        link.classList.remove("selected");
                    } else {
                        link.classList.add("selected");
                    }
                }

                if (!link.href.endsWith("/upgrade")) return;

                // Fix name
                // link.innerText = mapName;

                // Fix href
                const url = new URL(freeMapUrl);
                url.searchParams.set("map", mapName);
                link.setAttribute("href", url.toString());

                // Remove style
                link.removeAttribute("style");

                // Remove unnecessary attributes
                link.removeAttribute("target");
                link.removeAttribute("data-toggle");
                link.removeAttribute("title");
                link.removeAttribute("data-original-title");
                link.removeAttribute("data-placement");
            });
    }

    /**
     * Cleanup pro updrade ads.
     * @param window the window to cleanup
     */
    private static cleanupProUpgradeAds(window: Window) {
        window.document
            .querySelector("#button-upgrade")
            ?.parentElement?.parentElement?.remove();
        window.document.querySelector("#nitro-floating-wrapper")?.remove();
    }

    /**
     * Load the map script, and wait for the globals to be defined.
     */
    private static async loadMapScript(window: Window): Promise<void> {
        const script = await getElement<HTMLScriptElement>(
            "script[src^='https://cdn.mapgenie.io/js/map.js?id=']",
            window
        );

        if (!script) throw new Error("Map script not found");

        createScript({
            src: script.src.replace("id=", "ready&id="),
            appendTo: window.document.body
        });

        return timeout(waitForGlobals(["axios", "store"], window), 10 * 1000);
    }

    /**
     * Attach ui
     */
    private static attachUI(mapManager: FMG_MapManager): void {
        const ui = new FMG_UI(mapManager);

        mapManager.storage.subscribe(() => {
            ui.update();
        });
    }

    /**
     * Setup
     */
    public static async setup(window: Window): Promise<FMG_MapManager> {
        // Fix google maps global object
        FMG_Map.fixGoogleMaps(window);

        // Unlock maps locked by pro upgrade
        FMG_Map.unlockMaps(window);

        // Cleanup pro upgrade ads
        FMG_Map.cleanupProUpgradeAds(window);

        // Migrate data from previous versions
        FMG_Storage.migrateLegacyData(window);

        // Setup mock user if enabled
        if (FMG_ExtensionData.settings.mock_user) {
            window.user = {
                id: -1,
                role: "user"
            } as any;
        }

        // FMG_Map.enableEditor(window);

        // Get the map id from the meta data.
        // If this is set we will imitate another map
        // Only works with maps from the same game.
        await FMG_Map.loadMapData(window);

        // Initialize mapManager
        const mapManager = new FMG_MapManager(window);

        // Load map data
        await mapManager.load();

        // #if DEBUG
        window.fmgMapManager = mapManager;
        // #endif

        // Load user
        FMG_Map.loadUser(mapManager);

        // Configure
        FMG_Map.setupConfig(window);

        // Install storage filter, before we load the blocked map script
        const storageFilter = FMG_StorageFilter.install(mapManager.window);
        setupMapStorageFilter(storageFilter, mapManager);

        // If we have loaded a pro map, remember the map name so we can restore the url later.
        const map = new URL(window.location.href).searchParams.get("map");

        // After we fixed google maps and enabled pro features,
        // we can load the blocked map script
        await FMG_Map.loadMapScript(window);

        // If we have loaded a pro map, restore the url.
        if (map) {
            const url = new URL(window.location.href);
            url.searchParams.set("map", map);
            window.history.replaceState({}, "", url.toString());
        }

        // Install api filter, after we loaded the blocked map script
        const apiFilter = FMG_ApiFilter.install(mapManager.window);
        setupMapApiFilter(apiFilter, mapManager);

        // Finisish mapManager initialization
        // We need to do this after the map script is loaded,
        mapManager.init();

        // Attach ui
        FMG_Map.attachUI(mapManager);

        return mapManager;
    }
}
