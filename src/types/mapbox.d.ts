declare namespace MapboxGl {
    declare type GeometryType = "Point";

    declare interface Geometry {
        type: GeometryType;
        coordinates: [number, number];
    }

    declare type FeatureType = "Feature";

    declare interface Feature<P extends object = any> {
        id: number;
        type: FeatureType;
        properties: P;
        geometry: Geometry;
    }

    declare type SourceDataType = "FeatureCollection";

    declare interface SourceData<P extends object = any> {
        features: Feature<P>[];
        type: SourceDataType;
    }

    declare interface Source {
        id: string;
        _data: SourceData;
    }
}
