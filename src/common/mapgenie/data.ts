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

export const loadMapData = (map: MG.Api.MapFullForGame) => {
  if (!window.mapData) {
    throw new Error("mapData is not available on window");
  }

  const locations = getLocations(map);
  const categories = getCategories(map);

  window.mapData.map = map;
  window.mapData.groups = map.groups;
  window.mapData.locations = locations;
  window.mapData.categories = categories;
  window.mapData.mapConfig = map.config;
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
