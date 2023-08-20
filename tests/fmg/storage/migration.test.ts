import { FMG_StorageDataMigrator } from "@fmg/storage/migration";
import { JSDOM } from "jsdom";

describe("FMG_StorageDataMigrator", () => {
    beforeAll(() => {
        // Create a new dom
        const dom = new JSDOM("", {
            url: "https://mapgenie.io/"
        });

        // Set the window
        globalThis.window = dom.window as any;

        // Load the game data
        globalThis.window.game = {
            id: 20,
            slug: "tarkov",
            title: "Tarkov"
        } as any;

        // Load the map data
        globalThis.window.mapData = {
            maps: [
                { id: 64, slug: "streets" }, // tarkov/streets
                { id: 71, slug: "lighthouse" }, // tarkov/lighthouse
                { id: 75, slug: "reserve" } // tarkov/reserve
            ]
        } as any;
    });
});
