import { FMG_Maps } from "@fmg/info";
import { JSDOM } from "jsdom";

describe("FMG_Maps", () => {
    beforeAll(() => {
        const dom = new JSDOM("", {
            url: "https://mapgenie.io/"
        });
        globalThis.window = dom.window as any;
        globalThis.window.mapData = {
            maps: [
                { id: 64, slug: "streets" }, // tarkov/streets
                { id: 71, slug: "lighthouse" }, // tarkov/lighthouse
                { id: 75, slug: "reserve" } // tarkov/reserve
            ]
        } as any;
    });

    it("should cache te values", async () => {
        const mapsA = FMG_Maps.get(window);
        const mapsB = FMG_Maps.get(window);
        expect(mapsA).toBe(mapsB);
    });

    it("should return the correct map", async () => {
        const maps = FMG_Maps.get(window);

        for (const map of window.mapData!.maps) {
            expect((await maps.get(map.id)).map).toMatchObject({
                id: map.id,
                slug: map.slug
            });
        }
    });
});
