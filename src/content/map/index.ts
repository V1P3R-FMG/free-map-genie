import { getElement } from "@shared/dom";
import { timeout, waitForCallback, waitForGlobals } from "@shared/async";
import channel from "@shared/channel/content";

import { FMG_ApiFilter } from "@fmg/filters/api-filter";
import { FMG_StorageFilter } from "@fmg/filters/storage-filter";
import { FMG_HeatmapsData, FMG_MapData } from "@fmg/info";
import { FMG_MapManager } from "@fmg/map-manager";
import { FMG_StorageDataMigrator } from "@fmg/storage/migration";

import setupApiFilter from "@/content/filters/api-filter";
import setupStorageFilter from "@/content/filters/storage-filter";
import type { ExportedData } from "@fmg/storage/data/export";

import { FMG_UI } from "./ui";
import MapSwitcherPanel from "./map-panel";

declare global {
    export interface ContentChannel {
        exportData(): ExportedData | undefined;
        importData(data: { json: string }): void;
        clearData(): void;
    }
}

export const FmgMapInstalled = Symbol("FmgMapInstalled");

export type FmgMapWindow = Window & { [FmgMapInstalled]?: FMG_Map };

/**
 * The fmg map script
 * Handles all map related functionality
 */
export class FMG_Map {

    public readonly mapManager: FMG_MapManager;
    public readonly url: URL;
    public readonly ui: FMG_UI;

    public window: Window;
    private mapElement?: HTMLDivElement;
    private appElement?: HTMLDivElement;

    constructor(window: Window, mapManager?: FMG_MapManager) {
        this.window = window;
        this.mapManager = mapManager ?? new FMG_MapManager(window);
        this.url = new URL(window.location.href);
        this.ui = new FMG_UI(this.mapManager);
    }

    /**
     * Get map if map search param is provided.
     */
    private get map(): string | null {
        return this.url.searchParams.get("map");
    }

    /**
     * Get mapId if map search param is provided.
     */
    private get mapId(): number | null {
        return this.map
            ? this.window.mapData?.maps
                .find(map => map.slug === this.map)?.id
                    ?? (logger.error(
                        `Map(${this.map}) not found, valid maps: `,
                        this.window.mapData?.maps.map((map) => map.slug) || []
                    ), null)
            : this.window.mapData?.map.id ?? null;
    }

    /*
     * Because we delayed the map script, we need to manually create the google maps object.
     * If altMapSdk is enabled.
     * Because google.maps will allready be defined by another script,
     * and there for the map script will never define a maps mock object.
     **/
    private fixGoogleMaps(): void {
        if (this.window.config?.altMapSdk) {
            this.window.google = this.window.google || {};
            this.window.google.maps = {
                Size: function () {}
            };
        }
    }

    /**
     * Load mock user if enabled.
     * And fill in data from storage.
     * @param window the window to load the user in
     */
    private loadUser() {
        if (this.window.user) {
            const {
                locations,
                locationIds,
                presets,
            } = this.mapManager.storage.data;

            this.window.user = {
                ...this.window.user,
                trackedCategoryIds: this.mapManager.storage.data.categoryIds,
                suggestions: [],
                hasPro: true,
                locations,
                gameLocationsCount: locationIds.length,
                presets
            };
        }

        if (this.window.mapData) {
            const { notes } = this.mapManager.storage.data;
            this.window.mapData.notes = notes;
        }
    }

    /**
     * Enable map editor.
     * At the momment nothing usfull can be done with as far as i know.
     */
    private enableEditor() {
        this.window.isEditor = true;
        if (this.window.user) this.window.user.role = "admin";
    }

    /**
     * Load map data, from url params.
     */
    private async loadMapData() {
        if (!this.mapId) return;
        if (!this.window.game) throw new Error("Game not found in window.");
        if (!this.window.mapData) throw new Error("Mapdata not loaded.");

        const map = await FMG_MapData.get(this.window.game.id, this.mapId);
        
        // Urls
        this.window.mapUrl = map.url;

        // Map Data
        this.window.mapData = {
            ...this.window.mapData,
            ...map.mapData,
            regions: this.window.mapData.regions
        };

        this.window.initialZoom = map.config.initial_zoom;
        this.window.initialPosition = {
            lat: map.config.start_lat,
            lng: map.config.start_lng
        };

        if (this.window.mapData.heatmapGroups.length > 0) {
            const heatmaps = await FMG_HeatmapsData.get(this.mapId);

            this.window.mapData.heatmapGroups = heatmaps.groups;
            this.window.mapData.heatmapCategories = heatmaps.categories;
        }

        return;
    }

    /**
     * Enable pro features
     */
    private setupConfig(settings: FMG.Extension.Settings) {
        // Set configurations enabled.
        if (this.window.config) {
            if (settings.presets_allways_enabled) {
                this.window.config.presetsEnabled = true;
            }
        }
    }

    /**
     * Unlock maps in map switcher panel.
     */
    private unlockMaps() {
        if (!this.window.document.querySelector(".map-switcher-panel")) return;

        const panel = new MapSwitcherPanel();

        if (this.map) {
            panel.selectMap(this.map);
        }

        panel.unlock();
    }

    /**
     * Cleanup pro updrade ads.
     */
    private cleanupProUpgradeAds() {
        getElement("#button-upgrade", this.window, 5000).then(elem => elem.parentElement?.remove()).catch();
        getElement("#nitro-floating-wrapper", this.window, 5000).then(elem => elem.remove()).catch();
        getElement("#blobby-left", this.window, 5000).then(elem => elem.remove()).catch();
    }

    /**
     * Load the map script, and wait for the globals to be defined.
     */
    private async loadMapScript(): Promise<void> {
        if (this.appElement) this.appElement.id = "app";
        if (this.mapElement) this.mapElement.id = "map";

        const script = await getElement<HTMLScriptElement>(
            "script[src^='https://cdn.mapgenie.io/js/map.js?id=']",
            this.window
        );

        if (!script) throw new Error("Map script not found");

        const newScript = document.createElement("script");
        newScript.src = script.src.replace("id=", "ready&id=");
        this.window.document.body.appendChild(newScript);

        return timeout(
            waitForGlobals(["mapManager"], this.window),
            10000,
            "mapManager not found."
        );
    }

    /**
     * Attach ui
     */
    private async attachUI(): Promise<void> {
        await this.ui.attach();
        this.mapManager.on("fmg-location", () => this.ui.update());
        this.mapManager.on("fmg-category", () => this.ui.update());
        this.mapManager.on("fmg-update", () => this.ui.update());
    }

    /**
     * Setup window listeners
     */
    private setupListeners(): void {

        channel.onMessage("exportData", async () => {
            return this.mapManager.export();
        })

        channel.onMessage("importData", ({ json }) => {
            this.mapManager.import(json);
        });

        channel.onMessage("clearData", async () => {
            if (confirm("Are you sure you want to clear all data?")) {
                await this.mapManager.storage.clear();
                await this.mapManager.reload();
            }
        });
    }

    // public async preSetup(): Promise<void> {             
    //     const mapElement = await getElement<HTMLDivElement>("#map", this.window, 5000);
    //     const appElement = mapElement.parentElement!;
    //     mapElement.remove();
    //     appElement.remove();
        
    //     this.appElement = appElement.cloneNode(true) as HTMLDivElement;
    //     this.appElement.id = "_app";

    //     this.mapElement = mapElement.cloneNode(true) as HTMLDivElement;
    //     this.mapElement.id = "_map";

    //     this.appElement.insertBefore(this.mapElement, this.appElement.firstChild);
    //     this.window.document.body.appendChild(this.appElement);

    //     const control = this.appElement.querySelector(".mapboxgl-control-container");
    //     control?.remove();
    // }

    /**
     * Reload and update map.
     */
    public reload(): Promise<void> {
        return this.mapManager.reload();
    }

    /**
     * Check if we failed to load before map script.
     * If so reload the page, but only if we didn't reload before.
     */
    public refreshCheck(): void {
        if (this.window.store) {
            if (!this.window.sessionStorage.getItem("fmg:map:reloaded")) {
                this.window.sessionStorage.setItem("fmg:map:reloaded", "true");
                this.window.location.reload();
            } else {
                this.window.sessionStorage.removeItem("fmg:map:reloaded");
            }
        } else {
            this.window.sessionStorage.removeItem("fmg:map:reloaded");
        }
    }

    /**
     * Setup
     */
    public async setup(): Promise<void> {
        const settings = await channel.offscreen.getSettings();

        //this.refreshCheck();
        // await this.preSetup();

        // #if DEBUG
        window.fmgMapManager = this.mapManager;
        // #endif

        this.fixGoogleMaps();

        await timeout(waitForCallback(() => !!this.window.mapData), 5000, "Mapdata took to long to load.");

        // Setup mock user if enabled
        if (settings.mock_user) {
            this.window.user = {
                id: -1,
                role: "user",
            } as any;
        }

        await this.loadMapData();
        this.setupConfig(settings);

        await FMG_StorageDataMigrator.migrateLegacyData(this.window);
        await this.mapManager.load();

        if (this.window.user) {
            this.loadUser();
        } else {
            console.error("User not loggedin");
        }

        // Install storage filter, before we load the blocked map script
        const storageFilter = FMG_StorageFilter.install(this.window);
        setupStorageFilter(storageFilter, this.mapManager);

        // After we fixed google maps and enabled pro features,
        // we can load the blocked map script
        await this.loadMapScript();

        // Install api filter, after we loaded the blocked map script
        const apiFilter = FMG_ApiFilter.install(this.window);
        setupApiFilter(apiFilter, this.mapManager);

        // Finish mapManager initialization
        // We need to do this after the map script is loaded,
        this.mapManager.init(); 

        // Only attach ui if we are not in mini mode
        if (!this.window.isMini) {
            this.unlockMaps();
            this.cleanupProUpgradeAds();
            this.setupListeners();

            // If we have loaded a pro map, restore the url.
            if (this.map) {
                const url = new URL(this.window.location.href);
                url.searchParams.set("map", this.map!);
                this.window.history.replaceState({}, "", url.toString());
            }

            // Attach ui
            await this.attachUI()
                .catch(logger.error);
        }
    }
}
