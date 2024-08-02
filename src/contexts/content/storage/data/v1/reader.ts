import * as rw from "@utils/rw";

import { BaseReader } from "../../util/rw";

import {
    V1Data,
    V1MapData,
    V1SettingsData,
    type V1DataLayout,
    type V1MapDataLayout,
    type V1SettingsLayout,
} from "./index";

export default class V1DataReader extends BaseReader<V1DataLayout, V1Data> {
    public readonly default = "{}";

    public read(data: V1DataLayout): V1Data {
        return new V1Data(
            rw.readRecordSetToNumberSet(data.sharedData?.locations),
            this.readMapData(data.mapData),
            this.readSettingsData(data.settings)
        );
    }

    private readSettingsData(settingsData?: Record<string, V1SettingsLayout>): Record<string, V1SettingsData> {
        return Object.fromEntries(
            Object.entries(settingsData ?? {}).map(([mapId, data]) => [
                mapId,
                new V1SettingsData(data.remember_categories ?? false),
            ])
        );
    }

    private readMapData(mapData?: Record<string, V1MapDataLayout>): Record<string, V1MapData> {
        return Object.fromEntries(
            Object.entries(mapData ?? {}).map(([mapId, data]) => [
                mapId,
                new V1MapData(
                    rw.readRecordSetToNumberSet(data.categories),
                    this.readPresets(data.presets),
                    data.presets_order ?? [],
                    rw.readRecordSetToNumberSet(data.visible_categories)
                ),
            ])
        );
    }

    private readPresets(presets?: Record<string, MG.Preset>): MG.Preset[] {
        return Object.values(presets ?? {});
    }
}
