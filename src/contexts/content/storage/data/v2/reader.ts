import NumberSet from "@utils/set";
import * as rw from "@utils/rw";

import { BaseReader } from "../../util/rw";

import { V1MapData, V1SettingsData } from "../v1/index";

import { V2Data, type V2DataLayout } from "./index";

export default class V2DataReader extends BaseReader<V2DataLayout, V2Data> {
    public readonly default = "{}";

    public read(data: V2DataLayout): V2Data {
        return new V2Data(
            rw.readNumberSet(data.locationIds),
            rw.readNumberSet(data.categoryIds),
            data.notes ?? [],
            data.presets ?? [],
            data.presetOrder ?? [],
            rw.readNumberSet(data.visibleCategoriesIds)
        );
    }

    public readV1(locations: number[], map?: V1MapData, _settings?: V1SettingsData): V2Data {
        return new V2Data(
            NumberSet.new(locations),
            map?.categories ?? NumberSet.new(),
            [],
            map?.presets ?? [],
            map?.preset_order ?? [],
            map?.visible_categories ?? NumberSet.new()
        );
    }
}
