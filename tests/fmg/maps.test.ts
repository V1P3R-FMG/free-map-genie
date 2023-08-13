import { JSDOM } from "jsdom";
import { Maps } from "@fmg/maps";
import { MapData } from "@fmg/maps/map-data";
import { attachWindow } from "../mocks/iframe";

const maps = [
    { id: 122, title: "Nautiloid", slug: "nautiloid" },
    { id: 123, title: "Wilderness", slug: "wilderness" },
    { id: 124, title: "Shadow-Cursed Lands", slug: "shadow-cursed-lands" },
    { id: 125, title: "Baldur's Gate", slug: "baldurs-gate" }
];

const urls = [
    "https://mapgenie.io/baldurs-gate-3/maps/nautiloid",
    "https://mapgenie.io/baldurs-gate-3/maps/wilderness",
    "https://mapgenie.io/baldurs-gate-3/maps/shadow-cursed-lands",
    "https://mapgenie.io/baldurs-gate-3/maps/baldurs-gate"
];

const locations = ["63715", "63716", "63717", "20", "30"];
const locationsFiltered = ["63715", "63716", "63717"];

function createWindow(): any {
    const dom = new JSDOM(`<html><body></body></html>`, {
        url: "https://mapgenie.io/baldurs-gate-3/maps/nautiloid"
    });

    const window = dom.window;

    attachWindow(window, {
        markdownit() {
            return {
                renderer: {}
            };
        }
    });

    window.mapData = {} as any;
    window.mapData!.maps = maps;
    window.mapData!.map = window.mapData!.maps[0];

    window.game = {
        id: 44,
        title: "Baldur's Gate 3",
        slug: "baldurs-gate-3",
        ign_slug: "baldurs-gate-3"
    };

    return window;
}

describe("maps", () => {
    let window: Window = createWindow();

    afterEach(() => {
        window = createWindow();
    });

    it("should be able to create parse url correctly", () => {
        for (const [index, map] of Object.entries(maps)) {
            const url = MapData["getMapUrl"](window, map);
            expect(url).toBe(urls[index as any]);
        }
    });

    it("should load maps", async () => {
        const maps = new Maps(window);

        expect(maps.isLoaded).toBe(false);
        expect(maps.isLoading).toBe(false);

        await maps.load();
        expect(maps.isLoaded).toBe(true);
        expect(maps.isLoading).toBe(false);

        expect(maps.all.length).toBeGreaterThan(0);
    }, 10000);

    it("should filter locations", async () => {
        const maps = new Maps(window);
        await maps.load();

        const map = maps.get(122);
        expect(map).toBeDefined();

        const filtered = map!.filterLocations(locations);
        expect(filtered).toEqual(locationsFiltered);
    });
});
