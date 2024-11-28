jest.mock("@shared/channel/content.ts");

import GamesService from "@content/services/games.service";

window.user = { id: -1 } as MG.User;

const testData = jsonService.readJson<{
    gameId: number;
    maps: number[];
    locations: {
        id: number;
        expected: { mapId: number; gameId: number };
    }[];
}>("games.json");

describe("GamesService", () => {
    test.each(testData.locations.map((location) => [location.id, location.expected]))(
        "should be able to find the correct key for a given location %d",
        async (id, expected) => {
            const key = await GamesService.getKeyForLocation(testData.gameId, testData.maps, id);

            expect(key?.map).toBe(expected.mapId);
            expect(key?.game).toBe(expected.gameId);
            expect(key?.user).toBe(window.user?.id);
        }
    );
});
