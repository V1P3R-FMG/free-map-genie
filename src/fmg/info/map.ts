import FMG_GameData from "./game";

function parseMapInfo(map: MG.API.MapFull): MG.Info.Map {
    return {
        id: map.id,
        title: map.title,
        slug: map.slug
    };
}

function parsePolygon(region: MG.API.Region): MG.Feature[] | null {
    if (!region.polygon) return null;

    const coordinates = region.polygon.path
        .map(({ lat, lng }) => [lat, lng].map(Number) as [number, number]);

    coordinates.push(coordinates[0]);

    return [{
        type: "Feature",
        id: region.id,
        properties: {
            id: region.id
        },
        geometry: {
            type: "Polygon",
            coordinates
        },
    }];
}

function parseRegion(region: MG.API.Region): MG.Region {
    return {
        id: region.id,
        map_id: region.map_id,
        title: region.title,
        center_x: region.center_x,
        center_y: region.center_y,
        order: region.order,
        subtitle: region.subtitle,
        features: parsePolygon(region),
        parent_region_id: region.parent_region_id,
    };
}

function parseGroup(group: MG.API.Group, categories: MG.Category[]): MG.Group {
    return {
        id: group.id,
        game_id: group.game_id,
        title: group.title,
        color: group.color,
        order: group.order,
        expandable: group.expandable,
        categories
    }
}

function parseCategory(category: MG.API.Category): MG.Category {
    return {
        id: category.id,
        group_id: category.group_id,
        title: category.title,
        icon: category.icon,
        template: category.template,
        order: category.order,
        has_heatmap: category.has_heatmap,
        features_enabled: category.features_enabled,
        display_type: category.display_type,
        ign_enabled: category.ign_enabled,
        ign_visible: category.ign_visible,
        visible: category.visible,
        description: category.description,
        info: category.info ?? null,
        premium: category.premium
    }
}

function parseLocation(category: MG.Category, location: MG.API.Location): MG.Location {
    return {
        id: location.id,
        map_id: location.map_id,
        region_id: location.region_id,
        category_id: location.category_id,
        category,
        title: location.title,
        description: location.description,
        latitude: Number(location.latitude),
        longitude: Number(location.longitude),
        tags: location.tags,
        media: location.media,
        features: location.features ?? null,
        ign_page_id: null
    }
}

type PartialMapData = Omit<MG.Info.MapData, "notes" | "sharedNotes">;

function parseMapData(game: MG.API.GameFull, map: MG.API.MapFull): PartialMapData {
    const groups: MG.Group[] = [];
    const categories: DictById<MG.Category> = {};
    const locations: MG.Location[] = [];

    for (const group of map.groups) {
        const groupCategories = [];
        for (const category of group.categories) {
            const parsedCategory = parseCategory(category);

            categories[category.id] = parsedCategory;

            groupCategories.push(parsedCategory);

            for (const location of category.locations) {
                locations.push(parseLocation(parsedCategory, location));
            }
        }
        groups.push(parseGroup(group, groupCategories));
    }

    return {
        map: parseMapInfo(map),
        maps: game.maps.map(parseMapInfo),
        mapConfig: map.config,
        regions: map.regions.map(parseRegion),
        groups: groups,
        categories: categories,
        locations: locations,
        presets: game.default_presets
    }
}

export default class FMG_MapData {
    public readonly game: MG.API.GameFull;
    public readonly map: MG.API.MapFull
    public readonly mapData: PartialMapData;

    public readonly locationsById: DictById<MG.Location>;

    public constructor(game: MG.API.GameFull, map: MG.API.MapFull) {
        this.game = game;
        this.map = map;
        this.mapData = parseMapData(game, map);

        this.locationsById = Object.fromEntries(this.mapData.locations.map((loc) => [loc.id, loc]));
    }

    public get url() {
        return this.map.url;
    }

    public get config() {
        return this.map.config;
    }

    public static async get(gameId: Id, mapId: Id) {
        const game = await FMG_GameData.get(gameId);
        return game.getMap(mapId);
    }
}