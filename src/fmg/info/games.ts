export class FMG_Games {
    private static instance?: FMG_Games;

    private data: MG.Info.Game[];

    private constructor() {
        this.data = [];
    }

    public static async get(): Promise<MG.Info.Game[]> {
        if (!FMG_Games.instance) {
            FMG_Games.instance = new FMG_Games();
            await FMG_Games.instance.load();
        }
        return FMG_Games.instance.data;
    }

    private async load() {
        const res = await fetch("https://mapgenie.io/api/v1/games");
        this.data = await res.json();
    }
}
