declare namespace MG {
  declare namespace MapboxGL {
    import type {
      Map as _Map,
      GeoJSONSource as _GeoJSONSource,
      AnySourceImpl,
    } from "mapbox-gl";

    type MapboxGLMap = import("mapbox-gl").Map;

    interface FeatureSourceMap {
      "locations-data": GeoJSONSource;
      "regions-data": GeoJSONSource;
      "subregions-data": GeoJSONSource;
      "notes-data": GeoJSONSource;
      "routes-data": GeoJSONSource;
      "sugestions-data": GeoJSONSource;
      "circle-locations-data": GeoJSONSource;
      "polygon-locations-data": GeoJSONSource;
      "text-notes-data": GeoJSONSource;
      "text-locations-data": GeoJSONSource;
    }

    export class GeoJSONSource extends _GeoJSONSource {
      _data:
        | GeoJSON.Feature<GeoJSON.Geometry>
        | GeoJSON.FeatureCollection<GeoJSON.Geometry>
        | GeoJSON.Geometry
        | string
        | undefined;
    }

    export class Map extends _Map {
      getSource<K extends keyof FeatureSourceMap>(id: K): FeatureSourceMap[K];
      getSource(id: string): AnySourceImpl;
    }
  }
}
