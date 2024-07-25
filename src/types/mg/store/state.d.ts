declare namespace MG {
    declare interface MapState {
        activePresets: RecordSetById;
        categories: RecordById<Category>;
        categoryIds: number[];
        excludedLoctions: number[];
        groups: Group[];
        groupsById: RecordById<Group>;
        heatmapCategories: unknown[];
        heatmapGroups: unknown[];
        includedTagId: Nullable<unknown>;
        isEditingHeatmap: boolean;
        isEditingMarker: boolean;
        isEditingRoute: boolean;
        isSavingRoute: boolean;
        locations: Location[];
        locationByCategory: RecordById<Location>;
        locationById: RecordById<Location>;
        multiTagFilters: Record<unknown, unknown>;
        newLocation: Nullable<Location>;
        regionFilter: Nullable<unknown>;
        regions: Region[];
        routes: Route[];
        routesById: RecordById<Route>;
        selectedHeatmap: Nullable<Heatmap>;
        selectedLocation: Nullable<Location>;
        selectedRoute: Nullable<Route>;
        specificallyIncludedLocations: number[];
        tagFilters: RecordById<Tag>;
        tags: Tag[];
        timersVisible: boolean;
    }

    declare interface UserState {
        categoryProgress: unknown;
        foundLocations: RecordSetById;
        foundLocationsCount: number;
        isEditingNote: boolean;
        isMovingNote: boolean;
        noteGroupVisiblities: RecordSet<PrefixedColor>;
        notes: Note[];
        notesShown: boolean;
        presets: Preset[];
        routes: Route[];
        routesShown: boolean;
        selectedNote: Nullable<Note>;
        selectedRoute: Nullable<Route>;
        suggestionModeActive: boolean;
        suggestionPosition: Nullable<unknown>;
        suggestions: unknown[];
        suggestionsVisible: boolean;
        totalFoundLocationsCount: number;
        trackedCategories: number[];
    }

    declare interface EditorState {
        selectedCategory: Nullable<unknown>;
        selectedGroup: Nullable<unknown>;
        showAddMarkerControls: boolean;
    }

    declare interface SearchStateSearchResult {
        locations: number[];
        notes: Note[];
    }

    declare interface SearchState {
        currentInput: Nullable<unknown>;
        highlightedResult: Nullable<unknown>;
        previousCategories: number[];
        query: Nullable<string>;
        searchResults: SearchStateSearchResult;
    }

    declare interface RoutesState {
        isAddingNewRoute: boolean;
        isEditingRoute: boolean;
        isSavingRoute: boolean;
        routes: Route[];
        routesById: RecordById<Route>;
        selectedRoute: Nullable<Route>;
        sharedRoute: Nullable<Route>;
    }

    declare interface State {
        editor: EditorState;
        map: MapState;
        routes: RoutesState;
        search: SearchState;
        user: UserState;
    }
}
