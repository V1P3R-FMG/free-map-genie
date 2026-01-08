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
