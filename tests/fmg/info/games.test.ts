import { FMG_Games } from "@fmg/info";

describe("FMG_Games", () => {
    // Skipping this test because it is a expensive call to the API
    it.skip("should return a list of games", async () => {
        const games = await FMG_Games.get();
        expect(Object.getPrototypeOf(games)).toEqual(Array.prototype);
        expect(games.length).toBeGreaterThan(0);
        expect(games[0]).toMatchObject({
            id: expect.any(Number),
            ign_slug: expect.any(String),
            image: expect.any(String),
            logo: expect.any(String),
            slug: expect.any(String),
            title: expect.any(String)
        });
        expect(Object.getPrototypeOf(games[0].maps)).toEqual(Array.prototype);
    });
});
