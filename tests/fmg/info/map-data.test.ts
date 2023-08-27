import { FMG_MapData } from "@fmg/info";

describe("FMG_MapData", () => {
    beforeAll(() => {
        jest.spyOn(global, "fetch");
    });

    beforeEach(() => {
        FMG_MapData["cache"] = {};
        createWindow();
        jest.clearAllMocks();
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it("should return the correct map data", async () => {
        for (const map of window.mapData.maps) {
            const data = await FMG_MapData.get(map.id);
            expect(data).toBeDefined();
            expect(data.map).toMatchObject({
                id: map.id,
                slug: map.slug
            });
        }
    }, 15000);

    it("should cache map data", async () => {
        for (const map of window.mapData.maps) {
            const dataA = await FMG_MapData.get(map.id);
            const dataB = await FMG_MapData.get(map.id);
            expect(dataA).toBe(dataB);
        }
        expect(global.fetch).toHaveBeenCalledTimes(window.mapData.maps.length);
    }, 15000);
});
