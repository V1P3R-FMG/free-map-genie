import { createScript, getElement } from "@shared/dom";
import { timeout, waitForGlobals } from "@shared/async";
import { FMG_ApiFilter } from "@fmg/filters/api-filter";
import { FMG_StorageFilter } from "@fmg/filters/storage-filter";
import { FMG_Storage } from "@fmg/storage";
import { FMG_Store } from "@fmg/store";
import { FMG_MetaData } from "@fmg/meta-data";
import { FMG_MapData } from "@fmg/map-data";
import setupMapApiFilter from "./filters/api-filter";
import setupMapStorageFilter from "./filters/storage-filter";

export const FmgMapInstalled = Symbol("FmgMapInstalled");

export type FmgMapWindow = Window & { [FmgMapInstalled]?: FMG_Map };

/**
 * The fmg map script
 * Handles all map related functionality
 */
export class FMG_Map {
    private window: Window;
    private storage: FMG_Storage;
    private apiFilter: FMG_ApiFilter;
    private storageFilter: FMG_StorageFilter;
    private store: FMG_Store;

    protected constructor(window: Window) {
        this.window = window;

        this.storage = new FMG_Storage(window);

        this.apiFilter = FMG_ApiFilter.install(window);
        setupMapApiFilter(this.apiFilter);

        this.storageFilter = FMG_StorageFilter.install(window);
        setupMapStorageFilter(this.storageFilter);

        this.store = FMG_Store.install(window, this.storage);
    }

    /**
     * Install the map
     * @param window the window to install the map on
     * @returns the installed map
     */
    public static install(window: FmgMapWindow) {
        if (!window[FmgMapInstalled]) {
            window[FmgMapInstalled] = new FMG_Map(window);
        }
        return window[FmgMapInstalled];
    }

    /*
     * Because we delayed the map script, we need to manually create the google maps object.
     * If altMapSdk is enabled.
     * Because google.maps will allready be defined by another script,
     * and there for the map script will never define a maps mock object.
     **/
    private static fixGoogleMaps(): void {
        if (window.config?.altMapSdk) {
            window.google = window.google || {};
            window.google.maps = {
                Size: function () {}
            };
        }
    }

    /**
     * Enable pro features
     */
    private static async setProFeaturesEnabled(window: Window) {
        // Create a user
        // TODO: only set the required properties
        // TODO: make this configurable
        window.user = {
            id: 12346,
            role: "admin",
            locations: [],
            gameLocationsCount: 0,
            hasPro: false,
            trackedCategoryIds: [],
            suggestions: [],
            presets: []
        } as any;

        // Get the map id from the meta data
        // If this is set we will imitate another map
        // Only works with maps from the same game.
        const { mapId } = FMG_MetaData.get();
        if (mapId) {
            if (window.mapData) {
                const mapData = await FMG_MapData.get(mapId);
                window.mapData.mapConfig = mapData.mapConfig;
                window.mapData.groups = mapData.groups;
                window.mapData.categories = mapData.categories;
                window.mapData.locations = mapData.locations;
            }
        }

        // Usual pro features
        if (window.user) window.user.hasPro = true;
        if (window.config) window.config.presetsEnabled = true;
    }

    /**
     * Find the first free map url in the map switcher panel.
     * @param window the window to search in
     * @returns the first free map url
     */
    private static getFreeMapUrl(window: Window): string {
        for (const link of window.document.querySelectorAll<HTMLLinkElement>(
            ".map-switcher-panel .map-link"
        )) {
            if (!link.href.endsWith("/upgrade")) {
                return link.href;
            }
        }
        throw new Error("Free map url not found");
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

        const freeMapUrl = FMG_Map.getFreeMapUrl(window);
        window.document
            .querySelectorAll<HTMLLinkElement>(".map-switcher-panel .map-link")
            .forEach((link) => {
                if (!link.href.endsWith("/upgrade")) return;

                // Fix name
                const mapName = FMG_Map.getMapName(link);
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

    /*
     * Load the map script, and wait for the globals to be defined.
     **/
    private static async loadMapScript(): Promise<void> {
        const script = await getElement<HTMLScriptElement>(
            "script[src^='https://cdn.mapgenie.io/js/map.js?id=']"
        );

        if (!script) throw new Error("Map script not found");

        createScript({
            src: script.src.replace("id=", "ready&id="),
            appendTo: document.body
        });

        return timeout(waitForGlobals(["axios", "store"], window), 10 * 1000);
    }

    /**
     * Setup
     */
    public static async setup(window: Window) {
        FMG_Map.fixGoogleMaps();
        FMG_Map.unlockMaps(window);
        await FMG_Map.setProFeaturesEnabled(window);

        // After we fixed google maps and enabled pro features,
        // we can load the blocked map script
        await FMG_Map.loadMapScript();

        // After the map script is loaded, we can install our map script
        const map = FMG_Map.install(window);
        await map.storage.load();

        // #if DEBUG
        window.fmgMap = map;
        // #endif
    }
}
