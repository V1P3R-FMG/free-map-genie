import Key from "@content/storage/key";
import gamesChannel from "../channels/games.channel";

class MapData {
    public readonly config: MG.MapConfig;

    public readonly map: MG.Map;

    public readonly mapId: number;
    public readonly gameId: number;

    public readonly groupById: Record<string, MG.GroupFull>;
    public readonly categoriesById: Record<string, MG.CategoryFull>;
    public readonly locationsById: Record<string, MG.Location>;
    public readonly regionsById: Record<string, MG.Region>;

    public readonly groups: MG.GroupFull[];
    public readonly categories: MG.CategoryFull[];
    public readonly locations: MG.Location[];
    public readonly regions: MG.Region[];

    public constructor(map: MG.Api.MapFullForGame) {
        this.config = map.config;

        this.map = {
            id: map.id,
            slug: map.slug,
            title: map.title,
        };

        this.mapId = map.id;
        this.gameId = map.game_id;

        this.groups = map.groups;
        this.categories = map.groups.map((group) => group.categories).flat();
        this.locations = this.categories.map((category) => category.locations).flat();
        this.regions = map.regions;

        this.groupById = Object.fromEntries(this.groups.map((group) => [group.id, group]));
        this.categoriesById = Object.fromEntries(this.categories.map((category) => [category.id, category]));
        this.locationsById = Object.fromEntries(this.locations.map((location) => [location.id, location]));
        this.regionsById = Object.fromEntries(this.regions.map((region) => [region.id, region]));
    }
}

class Heatmaps {
    public readonly groups: MG.HeatmapGroup[];
    public readonly categories: MG.RecordById<MG.HeatmapCategory>;

    public constructor(groups: MG.Api.HeatmapGroup[]) {
        this.groups = groups.map((g) => ({
            ...g,
            heatmap_categories: g.categories,
        }));

        this.categories = Object.fromEntries(this.groups.map((g) => g.heatmap_categories.map((c) => [c.id, c])).flat());
    }
}

class GamesService {
    private readonly game: Record<string, MG.Api.GameFull> = {};
    private readonly maps: Record<string, MapData> = {};
    private readonly heatmaps: Record<string, Heatmaps> = {};

    public async getGame(gameId: number) {
        return (this.game[gameId] ??= await gamesChannel.getGame(gameId));
    }

    public async mapData(gameId: number, mapId: number) {
        const game = await this.getGame(gameId);
        const map = game.maps.find((m) => m.id === mapId);
        if (!map) throw `Map ${mapId} not found.`;
        return (this.maps[mapId] ??= new MapData(map));
    }

    public async getHeatmaps(mapId: number) {
        return (this.heatmaps[mapId] ??= new Heatmaps(await gamesChannel.getHeatmaps(mapId)));
    }

    public async mapConfig(gameId: number, mapId: number) {
        const mapData = await this.mapData(gameId, mapId);
        return mapData.config;
    }

    public async filterLocations(gameId: number, mapId: number, locations: number[]) {
        const mapData = await this.mapData(gameId, mapId);
        return locations.filter((id) => !!mapData.locationsById[id]);
    }

    public async filterCategories(gameId: number, mapId: number, categories: number[]) {
        const mapData = await this.mapData(gameId, mapId);
        return categories.filter((id) => !!mapData.categoriesById[id]);
    }

    public async getKeyForLocation(gameId: number, maps: number[], locationId: number) {
        if (!window.user) throw "No window user!";

        for (const mapId of maps) {
            const mapData = await this.mapData(gameId, mapId);
            if (mapData.locationsById[locationId]) {
                return Key.fromKeyData({
                    map: mapId,
                    game: mapData.gameId,
                    user: window.user.id,
                });
            }
        }
        return null;
    }

    public async getMapForHref(gameId: number, href: string) {
        const game = await this.getGame(gameId);
        if (!game) throw `Game with gameId ${gameId} not found.`;

        if (game.maps.length === 1) return game.maps[0];

        const url = new URL(href, window.origin);
        const slug = url.pathname.split("/").at(-1);
        if (!slug) throw `Invalid href ${href} no slug found.`;

        const map = game.maps.find((map) => map.slug === slug);

        if (map) {
            return this.mapData(gameId, map.id);
        }

        return null;
    }
}

export default new GamesService();
