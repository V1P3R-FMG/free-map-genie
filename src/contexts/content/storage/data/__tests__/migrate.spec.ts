jest.mock("../../../channels/games.channel");

import DataManager, { type Backup } from "../index";

import { loadMigrateData, loadStorageDriver } from "../__utils__/data";

import { V3DataWriter } from "../v3";
import type { V1DataLayout } from "../v1";
import type { V2DataLayout } from "../v2";

const writer = new V3DataWriter();

describe("storage migrate", () => {
    describe.each(["v1", "v2"] as const)("migrate data from %s -> v3", (version) => {
        const migrateData = loadMigrateData(version);

        describe("migration", () => {
            const mng = new DataManager(loadStorageDriver<V1DataLayout | V2DataLayout>(migrateData[version]));

            test.each(migrateData.keys.map(({ key, keyData }) => [key, keyData]))(
                "should have the correct data under key %s after migration",
                async (key, keyData) => {
                    const data = await mng.load(keyData);
                    const dataLayout = writer.write(data) ?? [[], [], [], [], []];

                    expect(dataLayout[0]).toIncludeSameMembers(migrateData.v3[key][0]);
                    expect(dataLayout[1]).toIncludeSameMembers(migrateData.v3[key][1]);
                    expect(dataLayout[2]).toIncludeSameMembers(migrateData.v3[key][2]);
                    expect(dataLayout[3]).toEqual(migrateData.v3[key][3]);
                    expect(dataLayout[4]).toEqual(migrateData.v3[key][4]);
                }
            );
        });

        describe("backups", () => {
            let mng: DataManager;

            beforeAll(async () => {
                mng = new DataManager(loadStorageDriver<V1DataLayout | V2DataLayout>(migrateData[version]));

                for (const { keyData } of migrateData.keys) {
                    await mng.load(keyData);
                }
            });

            describe.each(Object.entries(migrateData.backupKeys))("backups for %s", (_, keys) => {
                test.each(keys.map(({ key, count }) => [count, key]))(
                    "should have %i backups for key %s",
                    async (count, key) => {
                        await expect(mng.driver.has(key)).resolves.toBe(count > 0);

                        const backups: Backup[] = JSON.parse((await mng.driver.get(key)) ?? "[]");

                        expect(backups.length).toBe(count);
                    }
                );
            });
        });

        describe("remove old", () => {});
    });
});
