import { FMG_Maps } from "@fmg/info";
import { JSDOM } from "jsdom";

const locations = [
    "247891",
    "247853",
    20,
    50,
    247860,
    39228,
    50,
    247852,
    152352,
    "39206",
    150,
    152385,
    152362
];
const locationsFiltered = {
    75: ["39206", 39228],
    71: [152352, 152385, 152362],
    64: [247852, "247891", 247860, "247853"]
};

const categories = [941, "942", 50, 30, 944];
const categoriesFiltered = {
    75: [941, "942", 944],
    71: [941, "942", 944],
    64: [941, "942", 944]
};

describe("FMG_Maps", () => {
    beforeAll(() => {
        createWindow();
    });

    it("should cache te values", async () => {
        const mapsA = FMG_Maps.forGame(window.game.id);
        const mapsB = FMG_Maps.forGame(window.game.id);
        expect(mapsA).toBe(mapsB);
    });

    it("should return the correct map", async () => {
        const maps = FMG_Maps.forGame(window.game.id);

        for (const map of window.mapData!.maps) {
            expect((await maps.get(map.id)).map).toMatchObject({
                id: map.id,
                slug: map.slug
            });
        }
    }, 15000);

    it("should filter the locations by map", async () => {
        const maps = FMG_Maps.forGame(window.game.id);

        const filtered = await maps.filterLocations(locations);

        for (const map of window.mapData!.maps) {
            if (!categoriesFiltered[map.id as keyof typeof categoriesFiltered])
                continue;
            expect(filtered[map.id].sort()).toEqual(
                locationsFiltered[
                    map.id as keyof typeof locationsFiltered
                ].sort()
            );
        }
    });

    it("should filter the categories by map", async () => {
        const maps = FMG_Maps.forGame(window.game!.id);

        const filtered = await maps.filterCategories(categories);

        for (const map of window.mapData!.maps) {
            if (!categoriesFiltered[map.id as keyof typeof categoriesFiltered])
                continue;
            expect(filtered[map.id].sort()).toEqual(
                categoriesFiltered[
                    map.id as keyof typeof categoriesFiltered
                ].sort()
            );
        }
    });
});
