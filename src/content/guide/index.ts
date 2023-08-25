import { timeout, waitForGlobals } from "@shared/async";
import { getElement, getElementWithXPath } from "@shared/dom";

import { FMG_Map } from "@content/map";
import { FMG_ApiFilter } from "@fmg/filters/api-filter";
import type { FMG_MapManager } from "@fmg/map-manager";
import { FMG_CheckboxManager } from "./checkbox-manager";

import setupApiFilter from "@content/filters/api-filter";

export interface FMG_GuideSetupResult {
    reload: () => Promise<void>;
}

export class FMG_Guide {
    /**
     * Setup the mini map
     */
    public static async setupMiniMap(window: Window): Promise<FMG_MapManager> {
        // Get the map iframe element
        const mapElement = await timeout(
            getElement<HTMLIFrameElement>("#sticky-map iframe", window),
            10000
        );

        // Setup the map
        if (mapElement?.contentWindow) {
            const mapManager = await FMG_Map.setup(mapElement?.contentWindow);
            if (!mapManager) {
                throw new Error("Unable to setup map");
            }
            return mapManager;
        }

        throw new Error("Unable to find map element");
    }

    public static async cleanupProAds(window: Window) {
        await Promise.all(
            [
                //["//p[contains(., 'PRO')]", "xpath"],
                ["blockquote", "selector"],
                ["#button-upgrade", "selector"]
            ].map(async ([selector, type]) => {
                const element =
                    type === "selector"
                        ? await timeout(getElement(selector, window), 10000)
                        : type === "xpath"
                        ? await timeout(
                              getElementWithXPath(selector, window),
                              10000
                          )
                        : null;
                element?.remove();
            })
        );
    }

    /**
     * Setup the guide
     */
    public static async setup(window: Window): Promise<FMG_GuideSetupResult> {
        // Setup the mini map
        const mapManager = await FMG_Guide.setupMiniMap(window);

        if (mapManager.window.mapData) {
            window.mapData = window.mapData ?? ({} as any);
            window.mapData!.maps = mapManager.window.mapData.maps ?? [];
            window.mapData!.map = mapManager.window.mapData.map ?? {};
            window.game = window.game ?? mapManager.window.game;
        } else {
            throw new Error("Unable to find map data");
        }

        const checkboxManager = new FMG_CheckboxManager(window, mapManager);
        checkboxManager.reload();

        await timeout(waitForGlobals(["axios"], window), 10000);

        FMG_Guide.cleanupProAds(window).catch();

        // Setup the api filter
        const apiFilter = FMG_ApiFilter.install(window);
        setupApiFilter(apiFilter, mapManager);

        /// #if DEBUG
        window.fmgMapManager = mapManager;
        /// #endif

        logger.log("Guide setup complete");
        return {
            reload: async () => {
                await mapManager.reload(), checkboxManager.reload();
            }
        };
    }
}
