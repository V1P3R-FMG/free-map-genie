import { loadStorageData, type JsonFormat } from "../__utils__/data";

import { V1DataReader, V1DataWriter, type V1DataLayout } from "@content/storage/data/v1/index";

let testData: JsonFormat<V1DataLayout>;

beforeAll(() => {
    testData = loadStorageData("v1");
});

describe("v1 reader and writer", () => {
    it("it should read storage data", () => {
        Object.values(testData.storage).forEach((data) => {
            const reader = new V1DataReader();

            const v1Data = reader.read(data);

            expect(v1Data.locations).toEqual(data.sharedData?.locations ?? {});

            expect(Object.keys(v1Data.maps)).toIncludeSameMembers(Object.keys(data.mapData ?? {}));
            expect(Object.keys(v1Data.settings)).toIncludeSameMembers(Object.keys(data.settings ?? {}));

            Object.entries(data.mapData ?? {}).forEach(([mapId, map]) => {
                expect(v1Data.maps[mapId].categories).toEqual(map.categories ?? {});
                expect(v1Data.maps[mapId].visible_categories).toEqual(map.visible_categories ?? {});
                expect(v1Data.maps[mapId].preset_order).toEqual(map.presets_order ?? []);

                expect(v1Data.maps[mapId].presets.length).toEqual(Object.keys(map.presets ?? {}).length);
                Object.values(map.presets ?? {}).forEach((preset) => {
                    expect(v1Data.maps[mapId].presets[preset.id]).toEqual(preset);
                });
            });

            Object.entries(data.settings ?? {}).forEach(([mapId, settings]) => {
                expect(v1Data.settings[mapId].remember_categories).toEqual(settings.remember_categories);
            });
        });
    });

    it("it should write storage data", () => {
        Object.values(testData.storage).forEach((data) => {
            const reader = new V1DataReader();
            const writer = new V1DataWriter();

            const v1Data = writer.write(reader.read(data));

            expect(v1Data).toEqual(data);
        });
    });
});
