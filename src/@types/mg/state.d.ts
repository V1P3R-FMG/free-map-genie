declare namespace MG {
    interface State {
        user: State.User;
        map: State.Map;
        routes: State.Routes;
        search: State.Search;
        editor: State.Editor;
    }

    namespace State {
        interface User {
            foundLocations: DictById<boolean>;
            foundLocationsCount: number;
            totalFoundLocationsCount: number;

            isEditingNote: boolean;
            isMovingNote: boolean;

            noteGroupVisibilities: DictById<boolean>;
            notes: Note[];
            notesShown: false;

            presets: Preset[];

            routes: Route[];
            routesShown: boolean;

            selectedNote: Route | null;
            selectedRoute: Route | null;

            suggestionModeActive: false;
            suggestionPosition: null;
            suggestions: Suggestion[];

            trackedCategories: number[];
        }

        interface Map {
            activePresets: DictById<Id>;

            locations: Location[];
            locationsByCategory: DictById<Location[]>;
            locationsById: DictById<Location>;

            categories: DictById<Category>;
            categoryIds: number[];

            groups: Group[];
            groupsById: DictById<Group>;

            routes: Route[];
            routesById: DictById<Route>;

            tags: unknown[];

            heatmapCategories: unknown[];
            heatmapGroups: unknown[];

            newLocation: unknown | null;

            excludedLocations: number[];
            includedTagId: unknown | null;
            specificallyIncludedLocations: number[];

            selectedHeatmap: unknown | null;
            selectedLocation: Location | null;
            selectedRoute: Route | null;

            multiTagFilters: Record<any, unknown>;
            regionFilter: unknown | null;
            tagFilters: Record<any, unknown>;

            isEditingHeatmap: boolean;
            isEditingMarker: boolean;
            isEditingRoute: boolean;
            isSavingRoute: boolean;
        }

        interface Routes {
            isAddingNewRoute: boolean;
            isEditingRoute: boolean;
            isSavingRoute: boolean;

            routes: Route[];
            routesById: DictById<Route>;

            selectedRoute: Route | null;
            sharedRoute: Route | null;
        }

        interface Search {
            currentImput: unknown | null;
            highlightedResult: unknown | null;
            previousCategories: number[];
            query: string;
            searchResults: {
                locations: number[];
                notes: string[];
            };
        }

        interface Editor {
            showAddMarkerControls: boolean;
            selectedCategory: Category | null;
        }
    }
}
