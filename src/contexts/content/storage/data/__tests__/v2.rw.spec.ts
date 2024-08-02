jest.mock("../../../channels/games.channel");

import { loadStorageData, type JsonFormat } from "../__utils__/data";

import { V2DataReader, V2DataWriter, type V2DataLayout } from "@content/storage/data/v2/index";

let testData: JsonFormat<V2DataLayout>;

beforeAll(() => {
    testData = loadStorageData("v2");
});

describe("v2 reader and writer", () => {
    it("it should read storage data", () => {
        Object.values(testData.storage).forEach((data) => {
            const reader = new V2DataReader();

            const v2Data = reader.read(data);

            expect(v2Data.locations.values()).toEqual(data.locationIds ?? []);
            expect(v2Data.categories.values()).toEqual(data.categoryIds ?? []);
            expect(v2Data.visibleCategoriesIds.values()).toEqual(data.visibleCategoriesIds ?? []);
            expect(v2Data.presetOrder).toEqual(data.presetOrder ?? []);

            expect(v2Data.presets.length).toEqual(data.presets?.length ?? 0);
            expect(v2Data.notes.length).toEqual(data.notes?.length ?? 0);

            expect(v2Data.presets).toIncludeSameMembers(data.presets ?? []);
            expect(v2Data.notes).toIncludeSameMembers(data.notes ?? []);
        });
    });

    it("it should write storage data", () => {
        Object.values(testData.storage).forEach((data) => {
            const reader = new V2DataReader();
            const writer = new V2DataWriter();

            const v2Data = writer.write(reader.read(data));

            expect(v2Data).toEqual(data);
        });
    });
});
