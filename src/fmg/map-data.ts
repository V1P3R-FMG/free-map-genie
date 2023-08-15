/**
 * Get imformation about a map from mapgenie.io.
 */
export class FMG_MapData {
    private data: any;

    constructor(data: any) {
        this.data = data;
    }

    /**
     * Get map data from a mapId.
     * @param mapId the map id
     * @returns map data for the given mapId
     */
    public static async get(mapId: number): Promise<FMG_MapData> {
        const url = "https://mapgenie.io" + "/api/v1/maps/" + mapId + "/full";
        const res = await fetch(url);
        return new FMG_MapData(await res.json());
    }

    public get groups(): MG.Group[] {
        return this.data.groups;
    }

    public get categories(): DictById<
        MG.Category & { locations: MG.Location }
    > {
        return Object.fromEntries(
            [this.groups.map((g) => g.categories)]
                .flat(2)
                .map((cat) => [cat.id, cat])
        ) as any;
    }

    public get locations(): MG.Location[] {
        return Object.values(this.categories)
            .map((cat) => cat.locations)
            .flat(1);
    }

    public get mapConfig(): MG.MapConfig {
        return this.data.config;
    }
}
