import { FMG_Games } from "@fmg/info";

describe("FMG_Games", () => {
    beforeAll(() => {
        createWindow();
        jest.spyOn(global, "fetch");
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    // Skipping this test because it is a expensive call to the API
    it("should return a list of games", async () => {
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

    it("should return from cache if allready fetched", async () => {
        await FMG_Games.get();
        expect(global.fetch).toHaveBeenCalledTimes(0);
    });

    it("should return a single game when id is provided", async () => {
        const game = await FMG_Games.get(window.game.id);
        expect(game).toMatchObject({
            id: window.game.id,
            ign_slug: expect.any(String),
            image: expect.any(String),
            logo: expect.any(String),
            slug: window.game.slug,
            title: expect.any(String)
        });
    });

    it("should throw when game is not found", async () => {
        await expect(FMG_Games.get(-1)).rejects.toThrow(
            "Game with id -1 not found"
        );
    });
});
