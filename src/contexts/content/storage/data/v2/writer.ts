import * as rw from "@utils/rw";
import * as object from "@utils/object";

import { BaseWriter } from "../../util/rw";

import { V2Data, type V2DataLayout } from "./index";

export default class V2DataWriter extends BaseWriter<V2DataLayout, V2Data> {
    public write(data: V2Data) {
        const dataLayout: V2DataLayout = {};

        rw.writeNumberSet(dataLayout, "locationIds", data.locations);
        rw.writeNumberSet(dataLayout, "categoryIds", data.categories);
        rw.writeNumberSet(dataLayout, "visibleCategoriesIds", data.visibleCategoriesIds);

        rw.writeArray(dataLayout, "presetOrder", data.presetOrder);
        rw.writeArray(dataLayout, "notes", data.notes);
        rw.writeArray(dataLayout, "presets", data.presets);

        if (object.isEmpty(dataLayout)) {
            return null;
        }

        return dataLayout;
    }
}
