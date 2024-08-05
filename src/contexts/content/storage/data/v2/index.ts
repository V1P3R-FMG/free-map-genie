import type { IndexableNumberSet, NumberSetLayout } from "@utils/set";

import GamesService from "@content/services/games.service";

import type V1DataManager from "../v1/index";
import Key from "../../key";

import V2DataReader from "./reader";
import V2DataWriter from "./writer";

export { default as V2DataReader } from "./reader";
export { default as V2DataWriter } from "./writer";

export interface V2DataLayout {
    locationIds?: NumberSetLayout;
    categoryIds?: NumberSetLayout;
    notes?: MG.Note[];
    presets?: MG.Preset[];
    presetOrder?: NumberSetLayout;
    visibleCategoriesIds?: NumberSetLayout;
}

export class V2Data {
    public constructor(
        public readonly locations: IndexableNumberSet,
        public readonly categories: IndexableNumberSet,
        public readonly notes: MG.Note[],
        public readonly presets: MG.Preset[],
        public readonly presetOrder: number[],
        public readonly visibleCategoriesIds: IndexableNumberSet
    ) {}
}

export default class V2DataManager implements DataManagerImpl<V2Data, V1DataManager> {
    public readonly version = 2;

    public readonly reader = new V2DataReader();
    public readonly writer = new V2DataWriter();

    private readonly keyMatch = /fmg:game_(\d+):map_(\d+):user_(-?\d+)/;

    public constructor(public readonly driver: Driver) {}

    public async has(key: Key) {
        return this.driver.has(this.createKey(key));
    }

    public async save(key: Key, data: V2Data) {
        const serialized = this.writer.writeString(data);
        if (serialized) {
            await this.driver.set(this.createKey(key), serialized);
        } else {
            await this.driver.remove(this.createKey(key));
        }
    }

    public async load(key: Key) {
        const data = await this.driver.get(this.createKey(key));
        return this.reader.readString(data);
    }

    public async remove(key: Key) {
        await this.driver.remove(this.createKey(key));
    }

    public async upgrade(dm: V1DataManager, key: Key) {
        const v1Data = await dm.load(key);

        const locations = await GamesService.filterLocations(key.map, v1Data.locations.values());

        const v2Data = this.reader.readV1(locations, v1Data.maps[key.map], v1Data.settings[key.map]);

        locations.forEach((id) => v1Data.locations.delete(id));
        delete v1Data.maps[key.map];
        delete v1Data.settings[key.map];

        await this.save(key, v2Data);
        await dm.save(key, v1Data);
    }

    public async key(key: string) {
        const match = this.keyMatch.exec(key);
        if (!match) return null;
        return Key.fromKeyData({
            game: Number(match[1]),
            map: Number(match[2]),
            user: Number(match[3]),
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
        return `fmg:game_${key.game}:map_${key.map}:user_${key.user}`;
    }
}
