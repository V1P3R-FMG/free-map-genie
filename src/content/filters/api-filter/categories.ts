import type { FMG_ApiFilter } from "@fmg/filters/api-filter";
import type { FMG_MapManager } from "@fmg/map-manager";

export default function (filter: FMG_ApiFilter, mapManager: FMG_MapManager) {
    filter.registerFilter<{ category: number }>(
        "post",
        "categories",
        false,
        (_method, _key, _id, data, _url, block) => {
            logger.debug("track category", data.category);
            mapManager.storage.data.categories[data.category] = true;
            mapManager.fire("fmg-category", {
                id: data.category,
                tracked: true
            });
            block();
        }
    );

    filter.registerFilter<undefined>(
        "delete",
        "categories",
        true,
        (_method, _key, id, _data, _url, block) => {
            logger.debug("untrack category", id);
            delete mapManager.storage.data.categories[id];
            mapManager.fire("fmg-category", {
                id,
                tracked: false
            });
            block();
        }
    );
}
