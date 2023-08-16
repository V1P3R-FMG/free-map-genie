export class FMG_Games {
    private static instance?: FMG_Games;

    private data: MG.Game[];

    private constructor() {
        this.data = [];
    }

    public static async get(): Promise<MG.Game[]> {
        if (!FMG_Games.instance) {
            FMG_Games.instance = new FMG_Games();
            await FMG_Games.instance.load();
        }
        return FMG_Games.instance.data;
    }

    private async load() {
        const url =
            __CORS_PROXY__ +
            "?" +
            encodeURIComponent("https://mapgenie.io/api/v1/games");
        const res = await fetch(url);
        this.data = await res.json();
    }
}
