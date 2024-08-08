declare namespace MG {
    declare type MapFeatureSource = "locations-data" | "circle-locations-data";

    declare class MapboxglMap {
        //TODO
        public setFeatureState(
            feature: { source: MapFeatureSource; id: number | string },
            state: Record<string, any>
        ): void;

        public getSource(sourceId: MapFeatureSource): MapboxGl.Source;
    }

    declare class FoundLocationService {
        public onMarkLocation(locationId: Int, marked: boolean): void;
    }

    declare class MapManager {
        public routeToolControl: Nullable<unknown>;
        public foundLocationService: FoundLocationService;
        public addedNoteMarker: Nullable<NoteMarker>;
        public draggableNoteMarker: Nullable<NoteMarker>;
        public highlightAnimationRequestId: Nullable<unknown>;
        public highlightedLocationId: Nullable<number>;
        public iconSize: number;
        public imageOverlays?: unknown;
        public isToolInterceptingClicks: boolean;
        public map: Map;
        public mapTypeControl: Nullable<unknown>;
        public newLocationMarker: Nullable<unknown>;
        public newSuggestionClickListener: Nullable<unknown>;
        public notesById: RecordByStrId<Note>;
        public playerFollowingEnabled: boolean;
        public playerMarker: Nullable<unknown>;
        public playerTrailEnabled: boolean;
        public playerTrailMarkers: unknown[];
        public popup: Nullable<Popup>;
        public routeToolControl: Nullable<unknown>;
        public showFoundLocations: boolean;
        public store: Store;
        public suggestions: unknown[];
        public suggestionsById: RecordByStrId<unknown>;

        public addNewNote(): void;
        public addNewSuggestion(position: Position): void;
        public addPointMarker(): void;

        public panToLocation(locationId: Int): void;
        public panToLocations(locationIds: Int[]): void;
        public panToNote(noteId: string): void;

        public markLocationAsFound(locationId: Int, found: boolean): void;

        public setLocationFound(locationId: Int, found: boolean): void;
        public setLocationHighlighted(locationId: Int, highlighted: boolean): void;

        //TODO prototypes
        public deleteNoteMarker(note: Note): void;
        public createNote(note: Note): void;
        public openInfoWindow(location: Location): void;
        public autoPanPopup(): void;

        public setMarkerVisible(locationId: number, visible: boolean): void;
        public setMarkersVisible(locations: MG.Location[], visible: boolean): void;
        public setMarkersVisibleById(locationIds: number[], visible: boolean): void;

        public hideAllLocationMarkers(): void;

        public updateFoundLocationsStyle(): void;
    }

    declare type Alignment = "auto";

    declare class NoteMarker {
        _anchor: string;
        _clickTolerance: number;
        _color: PrefixedColor;
        _defaultMarker: boolean;
        _element: HTMLDivElement;
        _isDragging: boolean;
        _lngLat: Location;
        _map: Map;
        _offset: Vector2Int;
        _pitchAlignment: Alignment;
        _pointerDownPos: Nullable<unknown>;
        _popup: Nullable<unknown>;
        _pos: Vector2Int;
        _positionDelta: Nullable<unknown>;
        _rotation: Int;
        _rotationAlignment: Alignment;
        _scale: Int;
        _state: string;

        _addDragHandler(): void;
        _onKeyPress(): void;
        _onMapClick(): void;
        _onMove(): void;
        _onUp(): void;
        _update(): void;
    }

    declare class Popup {
        public _closeButton: HTMLButtonElement;
        public _container: HTMLDivElement;
        public _content: HTMLDivElement;
        public _tip: HTMLDivElement;
        public _lngLat: Position;
        public locationId: Int;

        public remove(): void;
        public _update(): void;
    }

    declare class Store {
        public dispatch<T extends StateActionType>(action: { type: T; meta: MetaForActionType<T> }): void;
        public getState(): State;
        public subscribe(f: (...args: any[]) => void): void;
        public replaceReducer(reducer: unknown);
    }
}
