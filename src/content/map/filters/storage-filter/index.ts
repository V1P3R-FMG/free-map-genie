import type {
    FMG_StorageFilter,
    StorageAction
} from "@fmg/filters/storage-filter";
import type { BlockCallback } from "@shared/async";

type RememberCategoryGroups = {
    gameId: string;
    categoryId: string;
};

function rememberCategoryHandler(
    _: Storage,
    action: StorageAction,
    key: string,
    value: string | undefined,
    groups: RememberCategoryGroups,
    block: BlockCallback
) {
    console.log("filter", action, key, value, groups);
    switch (action) {
        case "set":
            block();
            // TODO handle
            break;
        case "get":
            block();
            return "true";
        case "remove":
            block();
            break;
    }
}

export default function (filter: FMG_StorageFilter) {
    filter.registerFilter(
        "any",
        /mg:settings:game_(?<gameId>\d+):visible_categories:id_(?<categoryId>\d+)/,
        rememberCategoryHandler
    );
}
