export const createLocationsById = (map: MG.Api.MapFull) => {
  const locationsMap: Record<number, MG.Location> = {};

  for (const group of map.groups) {
    for (const category of group.categories) {
      for (const location of category.locations) {
        locationsMap[location.id] = location;
      }
    }
  }

  return locationsMap;
};

const getLocations = (map: MG.Api.MapFull) => {
  return map.groups
    .flatMap((group) => group.categories)
    .flatMap((category) => category.locations);
};

const getCategories = (map: MG.Api.MapFull) => {
  return Object.fromEntries(
    map.groups.flatMap((group) =>
      group.categories.map((category) => [category.id, category])
    )
  );
};

const xyPatternTilePaths = new Set([
  "tarkov/lighthouse/dark-v10",
  "tarkov/lighthouse/default-v10",
  "tarkov/streets/default-v10",
]);

export const getTileCoordinateSwapStorageKey = (
  gameId: number,
  mapId: number
) => `mg:settings:game_${gameId}:map_${mapId}:swap_tile_coordinates`;

export const getStoredTileCoordinateSwap = (gameId: number, mapId: number) => {
  try {
    return (
      JSON.parse(
        localStorage.getItem(getTileCoordinateSwapStorageKey(gameId, mapId)) ??
          "false"
      ) === true
    );
  } catch {
    return false;
  }
};

const getFallbackTilePattern = (
  path: string | undefined,
  extension: string,
  swapTileCoordinates = false
) => {
  const defaultOrder = path && xyPatternTilePaths.has(path) ? "xy" : "yx";
  const order =
    swapTileCoordinates ? (defaultOrder === "xy" ? "yx" : "xy") : defaultOrder;
  const coordinates = order === "xy" ? "{x}/{y}" : "{y}/{x}";

  return `${path}/{z}/${coordinates}.${extension}`;
};

const normalizeTileSet = (
  tileSet: Partial<MG.TileSet>,
  originalTileSet?: MG.TileSet,
  { swapTileCoordinates = false }: NormalizeTileSetOptions = {}
): MG.TileSet => {
  const path = tileSet.path ?? originalTileSet?.path;
  const extension = tileSet.extension ?? originalTileSet?.extension ?? "jpg";
  const pattern =
    tileSet.pattern ??
    (originalTileSet?.path === path ? originalTileSet?.pattern : undefined) ??
    getFallbackTilePattern(path, extension, swapTileCoordinates);

  return {
    ...originalTileSet,
    ...tileSet,
    pattern,
  } as MG.TileSet;
};

interface NormalizeTileSetOptions {
  swapTileCoordinates?: boolean;
}

const normalizeMapConfig = (
  config: MG.Api.MapFull["config"],
  originalConfig?: MG.MapConfig,
  { swapTileCoordinates = false }: NormalizeMapConfigOptions = {}
): MG.MapConfig => {
  return {
    ...config,
    tile_sets: config.tile_sets.map((tileSet) => {
      const originalTileSet = originalConfig?.tile_sets.find(
        (original) => original.path === tileSet.path
      );

      return normalizeTileSet(tileSet, originalTileSet, {
        swapTileCoordinates,
      });
    }),
  };
};

interface NormalizeMapConfigOptions {
  swapTileCoordinates?: boolean;
}

export interface LoadMapDataOptions {
  preserveMapConfig?: boolean;
  swapTileCoordinates?: boolean;
}

export const loadMapData = (
  map: MG.Api.MapFull,
  {
    preserveMapConfig = false,
    swapTileCoordinates = false,
  }: LoadMapDataOptions = {}
) => {
  if (!window.mapData) {
    throw new Error("mapData is not available on window");
  }

  const originalMapConfig = window.mapData.mapConfig;
  const locations = getLocations(map);
  const categories = getCategories(map);

  window.mapData.map = map;
  window.mapData.groups = map.groups;
  window.mapData.locations = locations;
  window.mapData.categories = categories;
  window.mapData.mapConfig = preserveMapConfig
    ? originalMapConfig
    : normalizeMapConfig(map.config, originalMapConfig, {
        swapTileCoordinates,
      });
  window.mapData.regions = map.regions;

  window.initialZoom = map.config.initial_zoom;
  window.initialPosition = {
    lat: map.config.start_lat,
    lng: map.config.start_lng,
  };
};

const getHeatmapGroups = (heatmapGroups: MG.Api.HeatmapGroup[]) => {
  return heatmapGroups.map((group) => ({
    ...group,
    heatmap_categories: group.categories,
  }));
};

const getHeatmapCategories = (heatmapGroups: MG.Api.HeatmapGroup[]) => {
  return Object.fromEntries(
    heatmapGroups.flatMap((group) =>
      group.categories.map((category) => [category.id, category])
    )
  );
};

export const loadHeatmaps = (heatmapGroups: MG.Api.HeatmapGroup[]) => {
  if (!window.mapData) {
    throw new Error("mapData is not available on window");
  }

  const heatmapGroupsProcessed = getHeatmapGroups(heatmapGroups);
  const heatmapCategories = getHeatmapCategories(heatmapGroups);

  window.mapData.heatmapGroups = heatmapGroupsProcessed;
  window.mapData.heatmapCategories = heatmapCategories;
};
