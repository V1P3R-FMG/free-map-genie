import channel from "@shared/channel/content";

export default class FMG_GamesData {
    private static data?: MG.API.Game[];

    public static async get(gameId: Id): Promise<MG.API.Game>;
    public static async get(): Promise<MG.API.Game[]>;
    public static async get(gameId?: Id): Promise<MG.API.Game[] | MG.API.Game> {
        // Load data if its not defined
        if (this.data == undefined)  await this.load();

        if (!gameId) {
            // If we did not specify a game id, return all games
            return this.getGames();
        } else {
            // Else return the game with the given id
            return this.getGame(gameId);
        }
    }

    private static async getGames() {
        if (!this.data) throw new Error("Failed to fetch games from mapgenie api.");
        return this.data;
    }

    private static async getGame(gameId: Id) {
        if (!this.data) throw new Error("Failed to fetch games from mapgenie api.");
        const game = this.data
            .find((game) => game.id == gameId);

        if (!game) {
            throw new Error(`Game with id ${gameId} not found`)
        }

        return game;
    }

    private static async load() {
        this.data = await channel.background.games();
    }
}
