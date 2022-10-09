type _Window = {
	fmgSettings?: ExtensionSettings,
	fmgDebug?: boolean,
} & typeof window;

declare namespace MG {

    export type Id = string|number;

    export type DictById<V> = Dict<MG.Id, V>;

    export type Media = {
        id: number,
        file_name: string,
        url: string,
        title: string,
        order: number,
        type: keyof ["image"],
        mime_type: ["image/png"]
        attribution: string,
        meta: unknown|null,
    };

    export type Location = {
        id: number,
        map_id: number,
        region_id: number,
        category_id: number,
        category: MG.Category
        title: string,
        description: string|null,
        latitude: number,
        longitude: number,
        features: unknown|null,
        ign_marker_id: number|null,
        ign_page_id: number|null,
        media: Array<MG.Media>,
        tags: Array<string>,
    };

    export type Category = {
        id: number,
        group_id: number,
        icon: string,
        title: string,
        order: number,
        description: string|null,
        info: string|null,
        premium: boolean,
        visible: boolean,
        has_heatmap: boolean,
        template: unknown|null,
    };

    export type Group = {
        id: number,
        title: string,
        color: string,
        game_id: number,
        order: number,
        categories: Array<MG.Category>,
    };

    export type Region = {
        id: number,
        title: string,
        map_id: number,
        order: number,
        parent_region_id: number|null,
        center_x: string,
        center_y: string,
    };

    export type Preset = {
        id: number,
        title: string,
        is_demo_preset?: boolean,
        order: number,
        categories: Array<number>
    };

    export type Note = {
        id: string,
        categroty: MG.Category|null,
        color: string|null,
        description: string,
        latitude: string,
        longitude: string,
        map_id: number,
        title: string,
        user_id: number,
    };

    export type Route = {

    };

    export type Game = {
        id: number,
        ign_slug: string,
        slug: string,
        title: string,
    };

    export type Map = {
        id: number,
        slug: string,
        title: string,
    };

    export type Suggestion = {

    };

    export type User = {
        id: number,
        hasPro: boolean,
        locations: Array<MG.Location>,
        presets: Array<MG.Preset>,
        role: keyof ["user"],
        suggestion: Array<MG.Suggestion>,
        trackedCategoriesIds: Array<number>
    };

    export type PresetOrder = Array<number>;

    export type TileSetBound = {
        x: { min: number, max: number },
        y: { min: number, max: number },
    };

    export type TileSet = {
        bounds: MG.DictById<TileSetBound>,
        extension: "jpg",
        max_zoom: number,
        min_zoom: number,
        name: string,
        path: string,
    };

    export type MapConfig = {
        initial_zoom: number,
        overlay: unknown|null,
        overzoom: boolean,
        start_lat: number,
        start_lng: number,
        tile_sets: Array<MG.TileSet>
    };

    export type MapData = {
        categories: MG.DictById<MG.Category>,
        locations: Array<MG.Location>,
        presets: Array<MG.Preset>,
        groups: Array<MG.Group>,
        routes: Array<MG.Route>,

        maps: Array<MG.Map>,
        map: MG.Map,
        mapConfig: MG.MapConfig,

        notes: Array<MG.Note>
        sharedNotes: Object

        tags: Array<string>,
        tagsById: Array<string>,

        heatmapCategories: Array<unknown>,
        heatmapGroups: Array<unknown>,

        proCategoryLocationCounts: Array<unknown>,

        distanceToolConfig: unknown|null,
        maxMarkedLocations: number,

        searchQuery: unknown|null,
    };

    export namespace MapManager {
        
        export type Popup = {
            _closeButton: HTMLButtonElement,
            _container: HTMLDivElement,
            _content: HTMLDivElement,
            _listeners: {
                open: Array<() => void>|undefined,
                close: Array<(a: unknown) => void>|undefined,
            },
            _lngLat: { lng: number, lat: number, },
            _onClose(): void,
            _onDrag(): void,
            _onMouseMove(): void,
            _onMouseUp(): void,
            _pos: { x: number, y: number },
            _tip: HTMLDivElement,
            _trackPointer: boolean,
            _update(): void,

            locationId: number,

            options: {
                anchor: string,
                offset: [number, number]
            }

            remove(): void,
        };
    }

    export namespace MapManager {
        export type Filter = {
            locationIds?: Array<MG.Id>,
            categoryIds?: Array<MG.Id>
        }
    }

    export type MapManager = {

        suggestions: Array<MG.Suggestion>,
        suggestionsById: MG.DictById<MG.Suggestion>,
        
        markLocationFound(id: MG.Id, found: boolean): void,

        setFoundLocationsShown(show: boolean): void,
        updateFoundLocationsStyle(): void,
        
        panToLocations(id: MG.Id): void,
        panToLocations(ids: Array<MG.Id>): void,
        panToNote(id: string): void,

        applyFilter(filter: MapManager.Filter): void,

        foundLocationService: {
            onMarkLocation(id: MG.Id, found: boolean): void,
            markLocationFound(id: MG.Id, found: boolean): void,
        },
        showFoundLocations: boolean,

        playerFollowingEnabled: boolean,
        playerMarker: unknown|null,
        playerTrailEnabled: boolean,
        playerTrailMarkers: Array<unknown>,

        routeToolControl: unknown|null,

        store: MG.Store,

        notesById: MG.DictById<MG.Note>,

        iconSize: number,

        popup: MG.MapManager.Popup,
    };

    export namespace State {

        export type User = {
            foundLocations: MG.DictById<boolean>,
            foundLocationsCount: number,
            totalFoundLocationsCount: number,

            isEditingNote: boolean,
            isMovingNote: boolean,

            noteGroupVisibilities: MG.DictById<boolean>,
            notes: Array<MG.Note>,
            notesShown: false

            presets: Array<MG.Preset>,

            routes: Array<MG.Route>,
            routesShown: boolean,

            selectedNote: MG.Route|null,
            selectedRoute: MG.Route|null,

            suggestionModeActive: false
            suggestionPosition: null
            suggestions: Array<MG.Suggestion>,

            trackedCategories: Array<number>
        };

        export type Map = {
            activePresets: MG.DictById<MG.Id>,

            locations: Array<MG.Location>,
            locationsByCategory: MG.DictById<Array<MG.Location>>,
            locationsById: MG.DictById<MG.Location>,

            categories: MG.DictById<MG.Category>,
            categoryIds: Array<number>,

            groups: Array<MG.Group>,
            groupsById: MG.DictById<MG.Group>,

            routes: Array<MG.Route>,
            routesById: MG.DictById<MG.Route>,

            tags: Array<unknown>,

            heatmapCategories: Array<unknown>,
            heatmapGroups: Array<unknown>,

            newLocation: unknown|null,

            excludedLocations: Array<number>,
            includedTagId: unknown|null,
            specificallyIncludedLocations: Array<number>,
            
            selectedHeatmap: unknown|null,
            selectedLocation: MG.Location|null,
            selectedRoute: MG.Route|null,
            

            multiTagFilters: Dict<unknown, unknown>,
            regionFilter: unknown|null,
            tagFilters: Dict<unknown, unknown>,

            isEditingHeatmap: boolean,
            isEditingMarker: boolean,
            isEditingRoute: boolean,
            isSavingRoute: boolean,
        };

        export type Routes = {
            isAddingNewRoute: boolean,
            isEditingRoute: boolean,
            isSavingRoute: boolean,

            routes: Array<MG.Route>,
            routesById: MG.DictById<MG.Route>,

            selectedRoute: MG.Route|null,
            sharedRoute: MG.Route|null,
        };

        export type Search = {
            currentImput: unknown|null,
            highlightedResult: unknown|null,
            previousCategories: Array<number>,
            query: string,
            searchResults: {
                locations: Array<number>,
                notes: Array<string>,
            }
        };

        export type Editor = {
            showAddMarkerControls: boolean,
            selectedCategory: MG.Category|null,
        };
    }

    export type State = {
        map: State.Map,
        user: State.User,
        search: State.Search,
        editor: State.Editor,
        routes: State.Routes
    };

    export namespace Store {

        export type Action = {
            type: string,
            meta?: object,
        };
    }

    export type Store = {
        dispatch(a: Store.Action): void,
        subscribe(cb: () => void): (() => void),
        getState(): MG.State,
    };

    export type Config = {
        altMapSdk: boolean,
        markerLinkEnabled: boolean,
        newSuggestionsEnabled: boolean,
        presetsEnabled: boolean,
        proOnlyMedia: boolean,
        regionFiltersEnabled: boolean,
        regionLocationFocusEnabled: boolean,
        rememberFiltersEnabled: boolean,
        routesEnabled: boolean,
        showRegionInInfoWindow: boolean,
        suggestionsEnabled: boolean,
        tooltipsEnabled: boolean,
        v2popupEnabled: boolean,
    };

    export type MapObject = {
        setFeatureState(e: { source: "locations-data", id: MG.Id }, { found: boolean }): void,
        setFeatureState(e: { source: "circle-locations-data", id: MG.Id }, { found: boolean }): void,
        loaded(): boolean,
    }

    export namespace Map {
        export interface Window extends _Window {
            //lib
            axios: Lib.Axios,
            toastr: Lib.Toastr,
    
            //booleans
            isEditor: boolean,
            isMini: boolean,
            isEmbedded: boolean,
            isMobile: boolean,
            isOverwolf: boolean,
    
            //globals
            mapTypeIds: Array<string>,
            mapUrl: string,
    
            map: MG.MapObject,
            user: MG.User,
            game: MG.Game,
    
            store: MG.Store,
            mapData: MG.MapData,
            mapManager: MG.MapManager,

            config: MG.Config,
    
            //init
            visibleCategories: Array<number>|null,
            visibleLocations: Array<number>|null,
        };
    }

    export namespace Guide {
        export interface Window extends _Window {

            //lib
            axios: Lib.Axios,
            toastr: Lib.Toastr,

            //globals
            isPro: boolean,

            foundLocations: MG.DictById<number>,

            markLocationFound(e: Event|{ target: HTMLElement }, id: MG.Id, found: boolean): void | undefined,

        };
    }

    export namespace List {
        export interface Window extends _Window {
            //lib
            toastr: Lib.Toastr,
        };
    }

    export type Window = Map.Window | Guide.Window | List.Window;
}

declare global {
	interface Window {
		fmgMap: any
		fngSettings: any
	}
}