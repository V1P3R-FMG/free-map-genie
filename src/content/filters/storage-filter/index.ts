import type { FMG_StorageFilter } from "@fmg/filters/storage-filter";
import type { FMG_MapManager } from "@fmg/map-manager";

const rememberCategoriesRegex =
    /mg:settings:game_(?<gameId>\d+):visible_categories:id_(?<categoryId>\d+)/;

export default function (
    filter: FMG_StorageFilter,
    mapManager: FMG_MapManager
) {
    filter.registerFilter<["gameId", "categoryId"]>(
        "get",
        rememberCategoriesRegex,
        (_storage, _action, _key, _value, { categoryId }, block) => {
            block();
            return mapManager.storage.data.visibleCategories[categoryId!]
                ? "true"
                : undefined;
        }
    );

    filter.registerFilter<["gameId", "categoryId"]>(
        "set",
        rememberCategoriesRegex,
        (_storage, _action, _key, _value, { categoryId }, block) => {
            block();
            mapManager.storage.data.visibleCategories[categoryId!] = true;
        }
    );

    filter.registerFilter<["gameId", "categoryId"]>(
        "remove",
        rememberCategoriesRegex,
        (_storage, _action, _key, _value, { categoryId }, block) => {
            block();
            delete mapManager.storage.data.visibleCategories[categoryId!];
        }
    );
}
