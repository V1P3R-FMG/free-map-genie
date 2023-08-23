import type { FMG_ApiFilter } from "@fmg/filters/api-filter";
import type { FMG_MapManager } from "@fmg/map-manager";

export default function (filter: FMG_ApiFilter, mapManager: FMG_MapManager) {
    filter.registerFilter<undefined>(
        "put",
        "locations",
        true,
        (_method, _key, id, _data, _url, block) => {
            logger.debug("mark location", id);
            mapManager.storage.data.locations[id] = true;
            mapManager.updatePopup();
            block();
        }
    );

    filter.registerFilter<undefined>(
        "delete",
        "locations",
        true,
        (_method, _key, id, _data, _url, block) => {
            logger.debug("unmark location", id);
            delete mapManager.storage.data.locations[id];
            mapManager.updatePopup();
            block();
        }
    );
}
