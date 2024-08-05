import type { IndexableNumberSet, NumberSetLayout } from "@utils/set";

import type V2DataManager from "../v2/index";
import Key from "../../key";

import V3DataReader from "./reader";
import V3DataWriter from "./writer";

export { default as V3DataReader } from "./reader";
export { default as V3DataWriter } from "./writer";

/**
 * @example
 * const v3PresetData = [
 *  number,         // preset.id
 *  string,         // preset.title
 *  number,         // preset.order
 *  NumberSetLayout // preset.categories
 * ];
 */
export type V3PresetDataLayout = [number, string, number, NumberSetLayout];

/**
 * @example
 * type V3NoteData = [
 *  string,             // note.id
 *  number,             // note.map_id
 *  number,             // note.user_id
 *  string,             // note.title
 *  string,             // note.description
 *  MG.Float,           // note.latitude
 *  MG.Float,           // note.longitude
 *  Nullable<string>    // note.color
 *  Nullable<number>    // note.category
 * ];
 */
export type V3NoteDataLayout = [
    string,
    number,
    number,
    string,
    string,
    MG.Float,
    MG.Float,
    Nullable<string>,
    Nullable<number>,
];

/**
 * V3PresetDataLayout = {@link V3PresetDataLayout}
 *
 * V3NoteDataLayout = {@link V3NoteDataLayout}
 *
 * @example
 * type V3DataLayout = [
 *  NumberSetLayout,        // data.locations
 *  NumberSetLayout,        // data.categories
 *  NumberSetLayout,        // data.visibleCategories
 *  V3PresetDataLayout[],   // data.presets
 *  V3NoteDataLayout[],     // data.notes
 * ];
 */
export type V3DataLayout = [
    NumberSetLayout,
    NumberSetLayout,
    NumberSetLayout,
    V3PresetDataLayout[],
    V3NoteDataLayout[],
];

export class V3PresetData {
    public constructor(
        public readonly id: number,
        public readonly title: string,
        public readonly order: number,
        public readonly categories: IndexableNumberSet
    ) {}
}

export class V3NoteData {
    public constructor(
        public readonly id: string,
        public readonly map_id: number,
        public readonly user_id: number,
        public readonly title: string,
        public readonly description: string,
        public readonly latitude: number,
        public readonly longitude: number,
        public readonly color: Nullable<string>,
        public readonly category: Nullable<number>
    ) {}
}

export class V3Data {
    public constructor(
        public readonly locations: IndexableNumberSet,
        public readonly categories: IndexableNumberSet,
        public readonly visibleCategories: IndexableNumberSet,
        public readonly presets: V3PresetData[],
        public readonly notes: V3NoteData[]
    ) {}
}

export default class V3DataManager implements DataManagerImpl<V3Data, V2DataManager> {
    public readonly version = 3;

    public readonly reader = new V3DataReader();
    public readonly writer = new V3DataWriter();

    private readonly keyMatch = /fmg:user_(-?\d+):game_(\d+):map_(\d+):v3/;

    public constructor(public readonly driver: Driver) {}

    public async has(key: Key) {
        return this.driver.has(this.createKey(key));
    }

    public async save(key: Key, data: V3Data) {
        const serialized = this.writer.writeString(data);
        if (serialized) {
            await this.driver.set(this.createKey(key), serialized);
        } else {
            await this.remove(key);
        }
    }

    public async load(key: Key) {
        const data = await this.driver.get(this.createKey(key));
        return this.reader.readString(data);
    }

    public async remove(key: Key) {
        await this.driver.remove(this.createKey(key));
    }

    public async upgrade(dm: V2DataManager, key: Key) {
        const data = await dm.load(key);
        const v3Data = this.reader.readV2(data);
        await this.save(key, v3Data);
        await dm.remove(key);
    }

    public async key(key: string) {
        const match = this.keyMatch.exec(key);
        if (!match) return null;
        return Key.fromKeyData({
            user: Number(match[1]),
            game: Number(match[2]),
            map: Number(match[3]),
        });
    }

    public async keys() {
        const keys = await this.driver.keys();
        const keyMatches = await Promise.all(
            keys.map(async (key) => {
                const keyData = await this.key(key);
                return keyData ? { key, keyData } : undefined;
            })
        );
        return keyMatches.filter((key) => key !== undefined);
    }

    public backupKeys(keyData: Key) {
        const key = this.createKey(keyData);
        const backupKey = key + ":backup";
        return [{ key, backupKey }];
    }

    private createKey(key: Key): string {
        return `fmg:user_${key.user}:game_${key.game}:map_${key.map}:v3`;
    }
}
