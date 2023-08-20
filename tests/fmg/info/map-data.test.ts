import { FMG_MapData } from "@fmg/info";

const maps = [
    { id: 64, slug: "streets" }, // tarkov/streets
    { id: 71, slug: "lighthouse" }, // tarkov/lighthouse
    { id: 75, slug: "reserve" } // tarkov/reserve
];

describe("FMG_MapData", () => {
    beforeAll(() => {
        jest.spyOn(global, "fetch");
    });

    it("should return the correct map data", async () => {
        for (const map of maps) {
            const data = await FMG_MapData.get(map.id);
            expect(data).toBeDefined();
            expect(data.map).toMatchObject({
                id: map.id,
                slug: map.slug
            });
        }
    });

    it("should cache map data", async () => {
        for (const map of maps) {
            const dataA = await FMG_MapData.get(map.id);
            const dataB = await FMG_MapData.get(map.id);
            expect(dataA).toBe(dataB);
        }
        expect(global.fetch).toHaveBeenCalledTimes(maps.length);
    });
});
