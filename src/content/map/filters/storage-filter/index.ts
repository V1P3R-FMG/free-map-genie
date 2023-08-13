import type { FMG_StorageFilter } from "@fmg/filters/storage-filter";

export default function (filter: FMG_StorageFilter) {
    filter.registerFilter<{ name: string }>(
        "set",
        /test@(?<name>\w+)/,
        (storage, action, key, value, groups, block) => {
            console.log("filter", storage, action, key, value, groups);
            block();
        }
    );
    filter.registerFilter<{ name: string }>(
        "get",
        /test@(?<name>\w+)/,
        (storage, action, key, value, groups, block) => {
            console.log("filter", storage, action, key, value, groups);
            block();
            return "Hello, " + groups.name;
        }
    );
}
