declare namespace MG {
    type MapFeatureState = "locations-data" | "circle-locations-data";

    interface Map {
        setFeatureState(
            feature: { source: MapFeatureState; id: number },
            state: Record<string, any>
        ): void;
    }
}
