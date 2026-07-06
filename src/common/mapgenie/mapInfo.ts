import { LazyGetter } from "lazy-get-decorator";

export class MapInfo {
  @LazyGetter({ select: (v) => v !== 0 })
  public static get totalMarkerLocations() {
    if (!window.mapData) return 0;

    return window.mapData.locations.filter((l) => this.isMarker(l)).length;
  }

  public static isMarker(location: MG.Location) {
    return this.isMarkerCategory(location.category);
  }

  public static isMarkerCategory(category: MG.Category) {
    return (
      category.display_type === "marker" ||
      category.display_type === "text|marker"
    );
  }
}
