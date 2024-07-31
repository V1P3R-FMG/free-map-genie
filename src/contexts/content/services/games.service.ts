import gamesChannel from "../channels/games.channel";

class MapData {
    public readonly config: MG.MapConfig;

    public readonly groupById: Record<string, MG.GroupFull>;
    public readonly categoriesById: Record<string, MG.CategoryFull>;
    public readonly locationsById: Record<string, MG.Location>;

    public readonly groups: MG.GroupFull[];
    public readonly categories: MG.CategoryFull[];
    public readonly locations: MG.Location[];

    public constructor(map: MG.Api.MapFull) {
        this.config = map.config;

        this.groups = map.groups;
        this.categories = map.groups.map((group) => group.categories).flat();
        this.locations = this.categories.map((category) => category.locations).flat();

        this.groupById = Object.fromEntries(this.groups.map((group) => [group.id, group]));
        this.categoriesById = Object.fromEntries(this.categories.map((category) => [category.id, category]));
        this.locationsById = Object.fromEntries(this.locations.map((location) => [location.id, location]));
    }
}

class GamesService {
    private readonly maps: Record<string, MapData> = {};

    public async mapData(mapId: number) {
        if (!(mapId in this.maps)) {
            this.maps[mapId] = new MapData(await gamesChannel.getMap(mapId));
        }
        return this.maps[mapId];
    }

    public async mapConfig(mapId: number) {
        const mapData = await this.mapData(mapId);
        return mapData.config;
    }

    public async filterLocations(mapId: number, locations: number[]) {
        const mapData = await this.mapData(mapId);
        return locations.filter((id) => !!mapData.locationsById[id]);
    }

    public async filterCategories(mapId: number, categories: number[]) {
        const mapData = await this.mapData(mapId);
        return categories.filter((id) => !!mapData.categoriesById[id]);
    }
}

export default new GamesService();
