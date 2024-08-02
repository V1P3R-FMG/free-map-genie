import { loadStorageData, type JsonFormat } from "../__utils__/data";

import { V3DataReader, V3DataWriter, type V3DataLayout } from "@content/storage/data/v3/index";

let testData: JsonFormat<V3DataLayout>;

beforeAll(() => {
    testData = loadStorageData("v3");
});

describe("v3 reader and writer", () => {
    it("it should read storage data", () => {
        Object.values(testData.storage).forEach((data) => {
            const reader = new V3DataReader();

            const v3Data = reader.read(data);

            expect(v3Data.locations.values()).toEqual(data[0]);
            expect(v3Data.categories.values()).toEqual(data[1]);
            expect(v3Data.visibleCategories.values()).toEqual(data[2]);

            expect(v3Data.presets.length).toEqual(data[3].length);
            expect(v3Data.notes.length).toEqual(data[4].length);

            data[3].forEach(([id, title, order, categories], i) => {
                expect(v3Data.presets[i].id).toEqual(id);
                expect(v3Data.presets[i].title).toEqual(title);
                expect(v3Data.presets[i].order).toEqual(order);
                expect(v3Data.presets[i].categories.values()).toEqual(categories);
            });

            data[4].forEach(([id, map_id, user_id, title, description, latitude, longitude, color, category], i) => {
                expect(v3Data.notes[i].id).toEqual(id);
                expect(v3Data.notes[i].map_id).toEqual(map_id);
                expect(v3Data.notes[i].user_id).toEqual(user_id);
                expect(v3Data.notes[i].title).toEqual(title);
                expect(v3Data.notes[i].description).toEqual(description);
                expect(v3Data.notes[i].latitude).toEqual(latitude);
                expect(v3Data.notes[i].longitude).toEqual(longitude);
                expect(v3Data.notes[i].color).toEqual(color);
                expect(v3Data.notes[i].category).toEqual(category);
            });
        });
    });

    it("it should write storage data", () => {
        Object.values(testData.storage).forEach((data) => {
            const reader = new V3DataReader();
            const writer = new V3DataWriter();

            const v3Data = writer.write(reader.read(data));

            expect(v3Data).toEqual(data);
        });
    });
});
