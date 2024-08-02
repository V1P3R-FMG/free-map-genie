import Key from "../key";

import V3DataManager, { type V3Data, type V3DataLayout } from "./v3/index";
import V2DataManager, { type V2DataLayout } from "./v2/index";
import V1DataManager, { type V1DataLayout } from "./v1/index";

export type LatestManager = V3DataManager;
export type LatestData = V3Data;

export interface Backup {
    version: number;
    key: string;
    data: string;
    at: number;
}

export interface DataManagersMap {
    v1: V1DataLayout;
    v2: V2DataLayout;
    v3: V3DataLayout;
}

export default class DataManager {
    private readonly managers: readonly DataManagerImpl[];

    public constructor(public readonly driver: Driver) {
        this.managers = [new V1DataManager(driver), new V2DataManager(driver), new V3DataManager(driver)];
    }

    private get current(): LatestManager {
        return this.managers.at(-1)! as LatestManager;
    }

    private *pairs(): Generator<[DataManagerImpl, DataManagerImpl]> {
        for (let [i, j] = [0, 1]; j < this.managers.length; j++, i++) {
            yield [this.managers[i], this.managers[j]];
        }
    }

    private async backup(version: number, keys: BackupKey[]) {
        await Promise.all(
            keys.map(async ({ key, backupKey }) => {
                if (!(await this.driver.has(key))) return;

                const backups = JSON.parse((await this.driver.get(backupKey)) ?? "[]") as Backup[];

                if (backups.length >= __MAX_BACKUPS_COUNT__) {
                    backups.shift();
                }

                const at = Date.now();
                const data = (await this.driver.get(key)) ?? "";

                backups.push({ version, key, data, at });

                await this.driver.set(backupKey, JSON.stringify(backups));
            })
        );
    }

    private async migrate(key: Key) {
        for (const [current, next] of this.pairs()) {
            if (!(await current.has(key))) continue;
            await this.backup(current.version, current.backupKeys(key));
            await next.upgrade(current, key);
        }
    }

    public async load(key: Key): Promise<LatestData> {
        if (!(await this.current.has(key))) {
            await this.migrate(key);
        }
        return this.current.load(key);
    }

    public async save(key: Key, data: LatestData) {
        await this.current.save(key, data);
    }
}
