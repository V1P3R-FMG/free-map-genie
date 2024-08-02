import * as rw from "@utils/rw";
import * as object from "@utils/object";

import { BaseWriter } from "../../util/rw";

import {
    V1Data,
    V1MapData,
    V1SettingsData,
    type V1DataLayout,
    type V1SharedDataLayout,
    type V1MapDataLayout,
    type V1SettingsLayout,
} from "./index";

export default class V1DataWriter extends BaseWriter<V1DataLayout, V1Data> {
    public write(data: V1Data) {
        const dataLayout: V1DataLayout = {};

        const sharedDataLayout: V1SharedDataLayout = {};
        const mapDataLayout: Record<string, V1MapDataLayout> = {};
        const settingsLayout: Record<string, V1SettingsLayout> = {};

        rw.writeNumberSetToRecordSet(sharedDataLayout, "locations", data.locations);
        this.writeMapData(mapDataLayout, data.maps);
        this.writeSettingsData(settingsLayout, data.settings);

        rw.writeRecord(dataLayout, "sharedData", sharedDataLayout);
        rw.writeRecord(dataLayout, "mapData", mapDataLayout);
        rw.writeRecord(dataLayout, "settings", settingsLayout);

        if (object.isEmpty(dataLayout)) {
            return null;
        }

        return dataLayout;
    }

    private writeSettingsData(target: Record<string, V1SettingsLayout>, settingsData: Record<string, V1SettingsData>) {
        for (const [mapId, data] of Object.entries(settingsData)) {
            const thisSettingsData: V1SettingsLayout = {};

            rw.writeBoolean(thisSettingsData, "remember_categories", data.remember_categories);

            rw.writeRecord(target, mapId, thisSettingsData);
        }
    }

    private writeMapData(target: Record<string, V1MapDataLayout>, mapData: Record<string, V1MapData>) {
        for (const [mapId, data] of Object.entries(mapData)) {
            const thisMapData: V1MapDataLayout = {};

            rw.writeNumberSetToRecordSet(thisMapData, "categories", data.categories);
            rw.writeNumberSetToRecordSet(thisMapData, "visible_categories", data.visible_categories);
            rw.writeArray(thisMapData, "presets_order", data.preset_order);
            this.writePresets(thisMapData, data.presets);

            rw.writeRecord(target, mapId, thisMapData);
        }
    }

    private writePresets(target: V1MapDataLayout, presets: MG.Preset[]) {
        const presetsRecord: Record<string, MG.Preset> = {};
        for (const preset of presets) {
            rw.writeRecord(presetsRecord, preset.id, preset);
        }
        rw.writeRecord(target, "presets", presetsRecord);
    }
}
