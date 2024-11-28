jest.mock("@shared/channel/content.ts");

import DataManager, { type Backup } from "../index";

import { loadMigrateData, loadStorageDriver } from "../__utils__/data";

import V3DataManager, { V3DataWriter } from "../v3";
import type { V1DataLayout } from "../v1";
import type { V2DataLayout } from "../v2";
import V1DataManager from "../v1";

const writer = new V3DataWriter();

describe("storage migrate", () => {
    describe.each([1, 2] as const)("migrate data from v%s -> v3", (version) => {
        const migrateData = loadMigrateData(`v${version}`);

        describe("migration", () => {
            const mng = new DataManager(loadStorageDriver<V1DataLayout | V2DataLayout>(migrateData[`v${version}`]));

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
            const mng: DataManager = new DataManager(
                loadStorageDriver<V1DataLayout | V2DataLayout>(migrateData[`v${version}`])
            );

            beforeAll(async () => {
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

        describe("remove old", () => {
            const mng: DataManager = new DataManager(
                loadStorageDriver<V1DataLayout | V2DataLayout>(migrateData[`v${version}`])
            );

            const v1Mng = new V1DataManager(mng.driver);
            const v2Mng = new V1DataManager(mng.driver);
            const v3Mng = new V3DataManager(mng.driver);

            beforeAll(async () => {
                for (const { keyData } of migrateData.keys) {
                    await mng.load(keyData);
                }
            });

            test.each(migrateData.keys.map(({ keyData }) => keyData))(
                "should remove the key %p for v1 and v2, and have only have data left for v3",
                (keyData) => {
                    expect(v1Mng.has(keyData)).resolves.toBeFalse();
                    expect(v2Mng.has(keyData)).resolves.toBeFalse();
                    expect(v3Mng.has(keyData)).resolves.toBeTrue();
                }
            );
        });
    });
});
