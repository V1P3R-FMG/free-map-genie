/**
 * Get imformation about a map from mapgenie.io.
 */
export class FMG_MapData {
    private static cache: DictById<FMG_MapData> = {};

    private data: any;

    private constructor(data: any) {
        this.data = data;
    }

    /**
     * Get map data from a mapId.
     * @param mapId the map id
     * @returns map data for the given mapId
     */
    public static async get(mapId: number): Promise<FMG_MapData> {
        if (!FMG_MapData.cache[mapId]) {
            const url =
                __CORS_PROXY__ +
                "?" +
                encodeURIComponent(
                    "https://mapgenie.io/api/v1/maps/" + mapId + "/full"
                );
            const res = await fetch(url, {
                headers: {
                    Origin: "https://mapgenie.io"
                }
            });
            FMG_MapData.cache[mapId] = new FMG_MapData(await res.json());
            console.log(FMG_MapData.cache[mapId]);
        }
        return FMG_MapData.cache[mapId];
    }

    public get url(): string {
        return this.data.url;
    }

    public get map(): MG.Info.Map {
        return {
            id: this.data.id,
            title: this.data.title,
            slug: this.data.slug,
            ign_slug: this.data.ign_slug
        };
    }

    public get maps(): MG.Info.Map[] {
        return this.data.maps;
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

    public get regions(): MG.Region[] {
        return this.data.regions;
    }

    public get presets(): MG.Preset[] {
        return [];
    }

    public get mapConfig(): MG.MapConfig {
        return this.data.config;
    }

    public get gameConfig(): MG.GameConfig {
        return this.data.game.config;
    }
}