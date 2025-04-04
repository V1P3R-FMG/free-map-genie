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
import AdsRemover from "@fmg/ads";

declare global {
    export interface ContentChannel {
        exportData(): ExportedData | undefined;
        importData(data: { json: string }): void;
        clearData(): void;
        importMapgenieAccount(): void;
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

    constructor(window: Window, mapManager?: FMG_MapManager) {
        this.window = window;
        this.mapManager = mapManager ?? new FMG_MapManager(window);
        this.url = new URL(window.location.href);
        this.ui = new FMG_UI(this.mapManager);
    }

    public get user(): number | null {
        return this.window.user?.id ?? null;
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

            this.window.fmgMapgenieAccountData = {
                locationIds: Object.keys(this.window.user.locations ?? {}).map(Number),
                categoryIds: this.window.user.trackedCategoryIds ?? []
            };

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

        const ogMapData = this.window.mapData;
        logger.debug("Original Mapdata: ", ogMapData);

        // Map Data
        this.window.mapData = {
            ...ogMapData,
            ...map.mapData,
            maxMarkedLocations: Infinity
        };

        // If we are not loading a pro map load some original data back
        if (!this.map) {
            this.window.mapData.mapConfig = ogMapData.mapConfig;
        }

        // Fix tilesets when neccesary
        for (var tileset of this.window.mapData.mapConfig.tile_sets) {
            if (tileset.pattern != undefined) continue;

            const ogTileset = ogMapData.mapConfig.tile_sets.find(({ name }) => tileset.name === name);

            if (!ogTileset) {
                logger.warn(`Failed to fix tileset ${tileset.name}, no original tileset found.`);
                continue;
            }

            if (ogTileset.pattern != undefined) {
                tileset.pattern = ogTileset.pattern;
            } else if (ogTileset.path != undefined) {
                tileset.pattern = `${ogTileset.path}/{z}/{x}/{y}.jpg`;
            } else {
                logger.warn(`Failed to fix tileset ${tileset.name}, no pattern or path found on original tileset.`);
            }
        }

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
        const adsRemover = new AdsRemover();
        adsRemover.registerSelector("#button-upgrade", true);
        adsRemover.registerSelector("#nitro-floating-wrapper");
        adsRemover.registerSelector("#blobby-left");
        adsRemover.removeElements();
    }

    /**
     * Load the map script, and wait for the globals to be defined.
     */
    private async loadMapScript(): Promise<void> {
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
            60000,
            "mapManager not found."
        );
    }

    /**
     * Attach ui
     */
    private async attachUI(): Promise<void> {
        this.ui.attach();
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

        channel.onMessage("importMapgenieAccount", async () => {
            if (!this.window.fmgMapgenieAccountData) throw "No mapgenie account data found.";

            if (!confirm("Trying to import mapgenie account data this will overide currently store data do you want to continue!")) return;
            
            this.mapManager.storage.autosave = false;

            for (const id of this.window.fmgMapgenieAccountData.locationIds) {
                this.mapManager.storage.data.locations[id] = true;
            }

            for (const id of this.window.fmgMapgenieAccountData.categoryIds) {
                this.mapManager.storage.data.categories[id] = true;
            }

            this.mapManager.storage.autosave = true;
            await this.mapManager.storage.save();

            await this.reload();
        });
    }

    /**
     * Reload and update map.
     */
    public reload(): Promise<void> {
        return this.mapManager.reload();
    }

    /**
     * Setup
     */
    public async setup(): Promise<void> {
        const settings = await channel.offscreen.getSettings();

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
