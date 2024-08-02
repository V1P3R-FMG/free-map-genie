import NumberSet from "@utils/set";

import Key from "../../key";

import V1DataReader from "./reader";
import V1DataWriter from "./writer";

export { default as V1DataReader } from "./reader";
export { default as V1DataWriter } from "./writer";

export interface V1SharedDataLayout {
    locations?: Record<string, boolean>;
}

export interface V1MapDataLayout {
    categories?: Record<string, boolean>;
    presets?: Record<string, MG.Preset>;
    presets_order?: number[];
    visible_categories?: Record<string, boolean>;
}

export interface V1SettingsLayout {
    remember_categories?: boolean;
}

export interface V1DataLayout {
    sharedData?: V1SharedDataLayout;
    mapData?: Record<string, V1MapDataLayout>;
    settings?: Record<string, V1SettingsLayout>;
}

export class V1MapData {
    public constructor(
        public readonly categories: NumberSet,
        public readonly presets: MG.Preset[],
        public readonly preset_order: number[],
        public readonly visible_categories: NumberSet
    ) {}
}

export class V1SettingsData {
    public constructor(public readonly remember_categories: boolean) {}
}

export class V1Data {
    public constructor(
        public readonly locations: NumberSet,
        public readonly maps: Record<string, V1MapData>,
        public readonly settings: Record<string, V1SettingsData>
    ) {}
}

export default class V1DataManager implements DataManagerImpl<V1Data, void> {
    public readonly version = 1;

    public readonly reader = new V1DataReader();
    public readonly writer = new V1DataWriter();

    private readonly keyMatch = /^mg:game_(\d+):user_(-?\d+):v5$/;

    public constructor(public readonly driver: Driver) {}

    public async has(key: Key) {
        return this.driver.has(this.createKey(key));
    }

    public async save(key: Key, data: V1Data) {
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

    public async upgrade(_: void) {
        throw "V1 has no legacy data.";
    }

    public async key(key: string) {
        const match = this.keyMatch.exec(key);
        if (!match) return null;
        return Key.fromKeyData({
            game: Number(match[1]),
            user: Number(match[2]),
            map: -1,
        });
    }

    public backupKeys(keyData: Key) {
        const key = this.createKey(keyData);
        const backupKey = key + ":backup";
        return [{ key, backupKey }];
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

    private createKey(key: Key): string {
        return `mg:game_${key.game}:user_${key.user}:v5`;
    }
}
