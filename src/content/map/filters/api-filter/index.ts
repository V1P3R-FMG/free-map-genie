import type { FMG_ApiFilter } from "@fmg/filters/api-filter";
import type { FMG_MapManager } from "@fmg/map-manager";
import locations from "./locations";
import categories from "./categories";
import presets from "./presets";
import notes from "./notes";

export default function (filter: FMG_ApiFilter, mapManager: FMG_MapManager) {
    locations(filter, mapManager);
    categories(filter, mapManager);
    presets(filter, mapManager);
    notes(filter, mapManager);
}
