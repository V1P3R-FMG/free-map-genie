import type { FMG_ApiFilter } from "@fmg/filters/api-filter";

export default function (filter: FMG_ApiFilter) {
    filter.registerFilter<undefined>(
        "put",
        "locations",
        (method, key, id, data, url, block) => {
            logger.log("filter", method, key, id, data, url);
            block();
        }
    );

    filter.registerFilter<undefined>(
        "delete",
        "locations",
        (method, key, id, data, url, block) => {
            logger.log("filter", method, key, id, data, url);
            block();
        }
    );
}
