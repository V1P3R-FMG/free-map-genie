import { loadStorageDriver, loadStorageData, type JsonFormat } from "../__utils__/data";

import V3DataManager, { type V3DataLayout } from "@content/storage/data/v3/index";

let testData: JsonFormat<V3DataLayout>;

beforeAll(() => {
    testData = loadStorageData("v3");
});

describe("v3 data", () => {
    it("should tell if a value exists", async () => {
        const mng = new V3DataManager(loadStorageDriver(testData.storage));

        await Promise.all(
            testData.keys.map(async ({ key, keyData }) => {
                await expect(mng.driver.has(key)).resolves.toBeTrue();
                await expect(mng.has(keyData)).resolves.toBeTrue();
            })
        );

        await expect(mng.has(testData.nonExistingKey.keyData)).resolves.toBeFalse();
    });

    it("should be able to save data", async () => {
        const mng = new V3DataManager(loadStorageDriver({}));

        await Promise.all(
            testData.keys.map(async ({ key, keyData }) => {
                await expect(mng.driver.has(key)).resolves.toBeFalse();

                await mng.save(keyData, mng.reader.read(testData.storage[key]));

                const json = await mng.driver.get(key);

                expect(mng.reader.decode(json)).toEqual(testData.storage[key]);
            })
        );
    });

    it("should be able to remove data when empty", async () => {
        const mng = new V3DataManager(loadStorageDriver({}));

        const { key, keyData } = testData.keys[0];

        await mng.save(keyData, mng.reader.read(testData.emptyData));

        await expect(mng.driver.has(key)).resolves.toBeFalse();
    });

    it("should be able to compress empty fields when saving", async () => {
        const mng = new V3DataManager(loadStorageDriver({}));

        const { key, keyData } = testData.keys[0];

        await mng.save(keyData, mng.reader.read(testData.nonEmptyData.data));

        const data = await mng.driver.get(key);

        expect(mng.reader.decode(data)).toEqual(testData.nonEmptyData.expected);
    });

    it("should be able to load data", async () => {
        const mng = new V3DataManager(loadStorageDriver(testData.storage));

        await Promise.all(
            testData.keys.map(async ({ key, keyData }) => {
                await expect(mng.driver.has(key)).resolves.toBeTrue();

                const data = await mng.load(keyData);

                expect(mng.writer.write(data)).toEqual(testData.storage[key]);
            })
        );
    });

    it("should be able to remove data", async () => {
        const mng = new V3DataManager(loadStorageDriver(testData.storage));

        await Promise.all(
            testData.keys.map(async ({ key, keyData }) => {
                await expect(mng.driver.has(key)).resolves.toBeTrue();

                await mng.remove(keyData);

                await expect(mng.driver.has(key)).resolves.toBeFalse();
            })
        );
    });

    it("should be able to extract keyData from a string key", async () => {
        const mng = new V3DataManager(loadStorageDriver(testData.storage));

        await Promise.all(
            testData.keys.map(({ key, keyData }) => {
                return expect(mng.key(key)).resolves.toEqual(keyData);
            })
        );
    });

    it("should get the keys associated with this version", async () => {
        const mng = new V3DataManager(loadStorageDriver(testData.storage));

        await expect(mng.keys()).resolves.toIncludeSameMembers(testData.keys);
    });
});
