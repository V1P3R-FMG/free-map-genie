import { LazyGetter } from "lazy-get-decorator";

export class MapInfo {
  @LazyGetter({ select: (v) => v !== 0 })
  public static get totalMarkerLocations() {
    if (!window.mapData) {
      return 0;
    }
    return window.mapData.locations.filter(
      (l) =>
        l.category.display_type === "marker" ||
        l.category.display_type === "text|marker"
    ).length;
  }
}
