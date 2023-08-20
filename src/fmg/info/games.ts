import corsProxy from "@shared/cors-proxy";

export class FMG_Games {
    private static instance?: FMG_Games;

    private data: MG.Game[];

    private constructor() {
        this.data = [];
    }

    public static async get(gameId: Id): Promise<MG.Game>;
    public static async get(): Promise<MG.Game[]>;
    public static async get(gameId?: Id): Promise<MG.Game[] | MG.Game> {
        if (!FMG_Games.instance) {
            FMG_Games.instance = new FMG_Games();
            await FMG_Games.instance.load();
        }

        // If we did not specify a game id, return all games
        if (!gameId) return FMG_Games.instance.data;

        // Else return the game with the given id
        return FMG_Games.instance.data.filter((game) => game.id == gameId);
    }

    private async load() {
        const res = await fetch(corsProxy("https://mapgenie.io/api/v1/games"));
        this.data = await res.json();
    }
}
