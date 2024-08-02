import * as array from "@utils/array";

import { BaseWriter } from "../../util/rw";

import {
    V3Data,
    V3PresetData,
    V3NoteData,
    type V3DataLayout,
    type V3PresetDataLayout,
    type V3NoteDataLayout,
} from "./index";

export default class V3DataWriter extends BaseWriter<Readonly<V3DataLayout>, V3Data> {
    public write(data: V3Data) {
        const dataLayout = [
            data.locations.values(),
            data.categories.values(),
            data.visibleCategories.values(),
            this.writePresets(data.presets),
            this.writeNotes(data.notes),
        ] as const;

        if (array.sumArray(dataLayout.map((arr) => arr.length)) === 0) {
            return null;
        }

        return dataLayout;
    }

    private writePreset(data: V3PresetData): V3PresetDataLayout {
        return [data.id, data.title, data.order, data.categories.values()];
    }

    private writePresets(data: V3PresetData[]): V3PresetDataLayout[] {
        return data.map((p) => this.writePreset(p));
    }

    private writeNote(data: V3NoteData): V3NoteDataLayout {
        return [
            data.id,
            data.map_id,
            data.user_id,
            data.title,
            data.description,
            data.latitude,
            data.longitude,
            data.color,
            data.category,
        ];
    }

    private writeNotes(data: V3NoteData[]): V3NoteDataLayout[] {
        return data.map((n) => this.writeNote(n));
    }
}
