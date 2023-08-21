import type { FMG_ApiFilter } from "@fmg/filters/api-filter";
import type { FMG_MapManager } from "@content/map/map-manager";

export default function (filter: FMG_ApiFilter, mapManager: FMG_MapManager) {
    filter.registerFilter<MG.Note>(
        "post",
        "notes",
        (method, key, id, data, url, block) => {
            logger.log("notes", method, key, id, data, url);
            block();
            return { data: { ...data, id: 0 } };
        }
    );

    filter.registerFilter<undefined>(
        "put",
        "notes",
        (method, key, id, data, url, block) => {
            logger.log("notes", method, key, id, data, url);
            block();
        }
    );

    filter.registerFilter<undefined>(
        "delete",
        "notes",
        (method, key, id, data, url, block) => {
            logger.log("notes", method, key, id, data, url);
            block();
        }
    );
}
