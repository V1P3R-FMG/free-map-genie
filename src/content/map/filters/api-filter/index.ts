import type { FMG_ApiFilter } from "@fmg/filters/api-filter";
import locations from "./locations";
import categories from "./categories";
import presets from "./presets";
import notes from "./notes";

export default function (filter: FMG_ApiFilter) {
    locations(filter);
    categories(filter);
    presets(filter);
    notes(filter);
}
