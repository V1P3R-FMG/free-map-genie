import async from "@/common/async";

export interface MarkLocationFoundMeta {
  mapId?: number | string | null;
  categoryId?: number | string | null;
  regionId?: number | string | null;
}

export class GuideState {
  public async waitForState() {
    await async.waitUntil(() => {
      try {
        return state !== undefined;
      } catch {
        return false;
      }
    });
    return state!;
  }

  public isExtendedState(state: any): state is MG.Guide.ExtendedState {
    return (
      state &&
      "foundLocationsByMap" in state &&
      "foundLocationsByCategory" in state &&
      "foundLocationsByRegion" in state
    );
  }

  public resetState() {
    state!.foundLocations = {};

    if (this.isExtendedState(state)) {
      Object.values(state.foundLocationsByMap).forEach((locations) => {
        locations.length = 0;
      });

      Object.values(state.foundLocationsByCategory).forEach((locations) => {
        locations.length = 0;
      });

      Object.values(state.foundLocationsByRegion).forEach((locations) => {
        locations.length = 0;
      });
    }
  }

  public fixStateForLocationId(checkbox: HTMLElement, locationId: number) {
    if (!this.isExtendedState(state)) return;

    const isFound = window.foundLocations![locationId] ?? false;
    if (!isFound) return;

    const $this = $(checkbox);
    const mapId = $this.data("map-id");
    const categoryId = $this.data("category-id");
    const regionId = $this.data("region-id");

    if (mapId) {
      state.foundLocationsByMap[mapId].push(locationId);
    }
    if (categoryId) {
      state.foundLocationsByCategory[categoryId].push(locationId);
    }
    if (regionId) {
      state.foundLocationsByRegion[regionId].push(locationId);
    }
  }

  public markLocationFound(locationId: number, found: boolean) {
    const $checkbox = $<HTMLInputElement>(
      `.check[data-location-id="${locationId}"]`
    );

    if ($checkbox.length === 0) {
      logger.warn(
        `No checkbox found for location ID ${locationId} to update its state`
      );
      return;
    }

    // Set checkbox state
    $checkbox.prop("checked", found);

    // If the guide has its own markLocationFound function, use it
    if (markLocationFound) {
      markLocationFound({ target: $checkbox.get(0)! }, locationId, found);
      return;
    }

    // Otherwise, just update the state
    state!.foundLocations[locationId] = found;
  }

  public updateCounts() {
    if (window.mapsById) {
      var mapIds = Object.keys(window.mapsById);
      for (var i = mapIds.length - 1; i >= 0; --i) {
        updateMapCount!(mapIds[i]);
      }
    }

    if (window.categoriesById) {
      var categoryIds = Object.keys(window.categoriesById);
      for (var i = categoryIds.length - 1; i >= 0; --i) {
        updateCategoryCount!(categoryIds[i]);
      }
    }

    if (window.regionsById) {
      var regionIds = Object.keys(window.regionsById);
      for (var i = regionIds.length - 1; i >= 0; --i) {
        updateRegionCount!(regionIds[i]);
      }
    }

    // Update overall found locations count
    // Ignore errors as function may not exist on some guides
    try {
      updateFoundLocationsCount?.();
    } catch {}
  }
}
