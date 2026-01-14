declare namespace MG.Guide {
  export type UpdateLocationFound = (
    event: EventLike,
    locationId: Id,
    found: boolean
  ) => void;

  export type UpdateCategoryCount = (categoryId: Id) => void;

  export type UpdateMapCount = (mapId: Id) => void;

  export type UpdateRegionCount = (regionId: Id) => void;

  export type UpdateFoundLocationsCount = () => void;

  export interface State {
    foundLocations: Record<Id, boolean>;
    ongoingRequests: number;
  }

  export interface ExtendedState extends State {
    filters: {
      activeMaps: string;
      activeCategories: string;
    };
    foundLocationsByCategory: Record<Id, number[]>;
    foundLocationsByMap: Record<Id, number[]>;
    foundLocationsByRegion: Record<Id, number[]>;
  }
}
