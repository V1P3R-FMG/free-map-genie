import { getElement } from "@shared/dom";
import { sleep, timeout, waitForCallback, waitForGlobals } from "@shared/async";

import { FMG_ApiFilter } from "@fmg/filters/api-filter";
import { FMG_StorageFilter } from "@fmg/filters/storage-filter";
import { FMG_MapData } from "@fmg/info/map-data";
import { FMG_ExtensionData } from "@fmg/extension-data";
import { FMG_MapManager } from "@fmg/map-manager";
import { FMG_StorageDataMigrator } from "@fmg/storage/migration";
import { FMG_UI } from "./ui";

import setupApiFilter from "@/content/filters/api-filter";
import setupStorageFilter from "@/content/filters/storage-filter";

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
            : null;
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
            this.window.user.trackedCategoryIds =
                this.mapManager.storage.data.categoryIds;
            this.window.user.suggestions = [];
            this.window.user.hasPro = true;
            this.window.user.locations = this.mapManager.storage.data.locations;
            this.window.user.gameLocationsCount =
                this.mapManager.storage.data.locationIds.length;
            this.window.user.presets = this.mapManager.storage.data.presets;
        }
        if (this.window.mapData) {
            this.window.mapData.notes = this.mapManager.storage.data.notes;
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
     * Fix tile_set
     */
    private fixTileset(tileSet: Omit<MG.TileSet, "pattern">, refTileSet: MG.TileSet): MG.TileSet {
        const prefix = tileSet.path.replace("/images/tiles/", "");
        const refPrefix = /[\w-_]+\/[\w-_]+\/[\w-_]+/.exec(refTileSet.path)?.[0];
        const refSubfix = refPrefix
            ? refTileSet.pattern
                .replace(refPrefix, "")
                .replace(/\.[\w]+/, `.${tileSet.extension ?? "png"}`)
            : `{z}/{x}/{y}.${tileSet.extension ?? "png"}`;
        return {
            ...tileSet,
            pattern: `${prefix}${refSubfix}`,
        };
    }

    /**
     * Load map data, from url params.
     */
    private async loadMapData() {
        if (!this.map || !this.mapId) return;
        if (!this.window.mapData) throw new Error("Mapdata not loaded.");

        const mapData = await FMG_MapData.get(this.mapId);

        // Urls
        this.window.mapUrl = mapData.url;

        // Map Data
        this.window.mapData.map = mapData.map;
        this.window.mapData.groups = mapData.groups;
        this.window.mapData.categories = mapData.categories;
        this.window.mapData.locations = mapData.locations;
        this.window.mapData.regions = mapData.regions;

        // Map Settings
        const ogMapConfig = this.window.mapData.mapConfig;
        const refTileSet = ogMapConfig.tile_sets[0];
        this.window.mapData.mapConfig = mapData.mapConfig;

        this.window.mapData.mapConfig.tile_sets = 
            this.window.mapData.mapConfig.tile_sets.map(set => this.fixTileset(set, refTileSet));

        this.window.initialZoom = mapData.mapConfig.initial_zoom;
        this.window.initiaPosition = {
            lat: mapData.mapConfig.start_lat,
            lng: mapData.mapConfig.start_lng
        };
        return;
    }

    /**
     * Enable pro features
     */
    private setupConfig() {
        // Set configurations enabled.
        if (this.window.config) {
            if (FMG_ExtensionData.settings.presets_allways_enabled) {
                this.window.config.presetsEnabled = true;
            }
        }
    }

    /**
     * Find the first free map url in the map switcher panel.
     * @returns the first free map url
     */
    private getFreeMapUrl(): string | null {
        let lockedMaps = 0;
        for (const link of this.window.document.querySelectorAll<HTMLLinkElement>(
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
    private getMapName(link: HTMLLinkElement): string {
        return link.innerText.replace(/\s?\[\w+\]/i, "").replace(" ", "-").toLowerCase();
    }

    /**
     * Unlock maps in map switcher panel.
     */
    private unlockMaps() {
        if (!this.window.document.querySelector(".map-switcher-panel")) return;

        const freeMapUrl = this.getFreeMapUrl();
        if (!freeMapUrl) return;
        this.window.document
            .querySelectorAll<HTMLLinkElement>(".map-switcher-panel .map-link")
            .forEach((link) => {
                const mapName = this.getMapName(link);

                // Fix selected when on a pro unlocked map
                if (this.map) {
                    if (mapName !== this.map) {
                        link.classList.remove("selected");
                    } else {
                        link.classList.add("selected");
                    }
                }

                if (!link.href || !link.href.endsWith("/upgrade")) return;

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
            //waitForGlobals(["axios", "store", "mapData", "game", "mapManager"], this.window),
            waitForGlobals(["mapManager"], this.window),
            10000
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

        this.ui.on("selected", async (e) => {
            const json = await e.detail.text();
            await this.mapManager.import(json);
        });
    }

    /**
     * Setup window listeners
     */
    private setupListeners(): void {
        this.window.addEventListener("message", async (e) => {
            try {
                switch (e.data.type) {
                    case "fmg::export-data": {
                        const id = e.data.id;
                        const type = "fmg::export-data::response";
                        const exportedData = await this.mapManager.export();
                        this.window.postMessage({ type, id, exportedData });
                        break;
                    }
                    case "fmg::import-data":
                        this.ui.importPopup.show();
                        break;
                    case "fmg::clear-data":
                        if (confirm("Are you sure you want to clear all data?")) {
                            await this.mapManager.storage.clear();
                            await this.mapManager.reload();
                        }
                        break;
                }
            } catch (e) {
                logger.error("Failed to handle message", e);
            }
        });
    }

    public async preSetup(): Promise<void> {
        if (!FMG_ExtensionData.settings.use_declarative_net_request) {
            logger.log("Using alternative block.");
             
            const mapElement = await getElement<HTMLDivElement>("#map", this.window, 5000);
            const appElement = mapElement.parentElement!;
            mapElement.remove();
            appElement.remove();
            
            this.appElement = appElement.cloneNode(true) as HTMLDivElement;
            this.appElement.id = "_app";

            this.mapElement = mapElement.cloneNode(true) as HTMLDivElement;
            this.mapElement.id = "_map";

            this.appElement.insertBefore(this.mapElement, this.appElement.firstChild);
            this.window.document.body.appendChild(this.appElement);

            const control = this.appElement.querySelector(".mapboxgl-control-container");
            control?.remove();
        } else {
            logger.log("Using declarative net requests.");
        }
    }

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
        //this.refreshCheck();
        await this.preSetup();

        // #if DEBUG
        window.fmgMapManager = this.mapManager;
        // #endif

        this.fixGoogleMaps();

        await timeout(waitForCallback(() => !!this.window.mapData), 5000, "Mapdata took to long to load.");
        if (!FMG_ExtensionData.settings.use_declarative_net_request) {
            await sleep(500);
        }

        // Setup mock user if enabled
        if (FMG_ExtensionData.settings.mock_user) {
            this.window.user = {
                id: -1,
                role: "user",
            } as any;
        }

        await this.loadMapData();
        this.setupConfig();

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
