import * as rw from "@utils/rw";

import { BaseReader } from "../../util/rw";

import type { V2Data } from "../v2/index";

import {
    V3Data,
    V3PresetData,
    V3NoteData,
    type V3DataLayout,
    type V3PresetDataLayout,
    type V3NoteDataLayout,
} from "./index";

export default class V3DataReader extends BaseReader<V3DataLayout, V3Data> {
    public readonly default = "[[],[],[],[],[]]";

    public read(data: V3DataLayout): V3Data {
        return new V3Data(
            rw.readNumberSet(data[0]),
            rw.readNumberSet(data[1]),
            rw.readNumberSet(data[2]),
            data[3].map((p) => this.readV3Preset(p)),
            data[4].map((n) => this.readV3Note(n))
        );
    }

    public readV2(data: V2Data): V3Data {
        return new V3Data(
            data.locations,
            data.categories,
            data.visibleCategoriesIds,
            data.presets.map((p) => this.readV2Preset(p)),
            data.notes.map((n) => this.readV2Note(n))
        );
    }

    private readV2Preset(data: MG.Preset): V3PresetData {
        return new V3PresetData(data.id, data.title, data.order, rw.readNumberSet(data.categories));
    }

    private readV3Preset(data: V3PresetDataLayout): V3PresetData {
        return new V3PresetData(data[0], data[1], data[2], rw.readNumberSet(data[3]));
    }

    private readV3Note(data: V3NoteDataLayout): V3NoteData {
        return new V3NoteData(...data);
    }

    private readV2Note(data: MG.Note): V3NoteData {
        return new V3NoteData(
            data.id,
            data.map_id,
            data.user_id,
            data.title,
            data.description,
            data.latitude,
            data.longitude,
            data.color,
            data.category
        );
    }
}
