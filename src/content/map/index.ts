import { createScript, getElement } from "@shared/dom";
import { timeout, waitForGlobals } from "@shared/async";
import { FMG_ApiFilter } from "@fmg/filters/api-filter";
import { FMG_StorageFilter } from "@fmg/filters/storage-filter";
import { FMG_Storage } from "@fmg/storage";
import { FMG_Store } from "@fmg/store";
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

        this.setProFeaturesEnabled();
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

    /**
     * Enable pro features
     */
    private setProFeaturesEnabled() {
        if (this.window.user) this.window.user.hasPro = true;
        if (this.window.config) this.window.config.presetsEnabled = true;
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

        await FMG_Map.loadMapScript();

        const map = FMG_Map.install(window);

        // #if DEBUG
        window.fmgMap = map;
        // #endif
    }
}
