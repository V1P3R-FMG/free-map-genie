declare namespace MG {
    type MapFeatureState = "locations-data" | "circle-locations-data";

    interface Map {
        setFeatureState(
            feature: { source: MapFeatureState; id: number },
            state: Record<string, any>
        ): void;
    }

    interface MapManager {
        setLocationFound(locationId: Id, found: boolean): void;
        deleteNoteMarker(note: MG.Note): void;
        createNote(note: MG.Note): void;
        openInfoWindow(location: MG.Location): void;
    }
}
