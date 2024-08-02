declare namespace MG.Actions {
    declare namespace Meta {
        declare type NoMeta = undefined;

        declare interface Initialize {
            appState: State;
        }

        declare interface Found {
            found: boolean;
        }

        declare interface Count {
            count: number;
        }

        declare interface Active {
            active: boolean;
        }

        declare interface Enabled {
            enabled: boolean;
        }

        declare interface Selected {
            selected: boolean;
        }

        declare interface Additive {
            additive: boolean;
        }

        declare interface Query {
            query: string;
        }

        declare interface LocationsIds {
            locationIds: number[];
        }

        declare interface CategoryIds {
            categoryIds: number[];
        }

        declare interface Visibility {
            visible: boolean;
        }

        declare interface Visibilities {
            visibilities: RecordById<boolean>;
        }

        declare interface NoteGroup {
            groupId: PrefixedColor;
        }

        declare interface Note {
            note: MG.Note;
        }

        declare interface Preset {
            preset: MG.Preset;
        }

        declare interface Location {
            location: MG.Location;
        }

        declare interface Group {
            group: MG.Group;
        }

        declare interface Category {
            category: MG.Category;
        }

        declare interface Route {
            route: MG.Route;
        }

        declare interface SelectedNote {
            selectedNote: MG.Note;
        }

        declare interface SelectedCategory {
            selectedCategory: MG.Category;
        }

        declare interface SelectedGroup {
            selectedGroup: MG.Group;
        }

        declare interface EditingNote {
            isEditingNote: boolean;
        }

        declare interface EditingMarker {
            isEditingMarker: boolean;
        }

        declare interface EditingHeatmap {
            isEditingHeatmap: boolean;
        }

        declare interface SavingRoute {
            isSavingRoute: boolean;
        }

        declare interface NoteId {
            noteId: string;
        }

        declare interface CategoryId {
            categoryId: number;
        }

        declare interface PresetId {
            presetId: number;
        }

        declare interface LocationId {
            locationId: number;
        }

        declare interface Presets {
            presets: MG.Preset[];
        }

        declare interface ActivePresets {
            activePresets: MG.Preset[];
        }

        declare interface Categories {
            categories: RecordById<MG.Category>;
        }

        declare interface Suggestion {
            suggestion: unknown;
        }

        declare interface SuggestionPosition {
            suggestionPosition: Nullable<Position>;
        }

        declare interface Position extends MG.Position {}

        declare interface UpdateLocations {
            locationsById: RecordById<MG.Location>;
        }

        declare interface Features {
            features: MG.Feature[];
        }

        declare interface LocationFilter {
            testFilter: unknown;
            inclusionFilter: unknown;
        }

        declare interface RegionFilter {
            regionId: number;
            includeSubregions?: unknown;
        }

        declare interface TagFilters {
            tagFilters: unknown;
            modifiedCategoryIds: unknown;
            legacyTagFilters?: unknown;
        }

        declare interface SearchResults {
            searchResults: unknown[];
        }

        declare interface LocationHighlighted {
            result: number;
            highlighted: boolean;
        }
    }

    declare interface ActionsMap<T> {
        [key: T]: Record<any, any>;
    }

    declare interface UserStateActionsMap {
        ["MG:USER:INITIALIZE"]: Meta.Initialize;
        ["MG:USER:MARK_LOCATION"]: Meta.Location & Meta.Found;
        ["MG:USER:MARK_LOCATIONS"]: Meta.LocationIds & Meta.Found;
        ["MG:USER:UPDATE_FOUND_LOCATIONS_COUNT"]: Meta.Count;
        ["MG:USER:UPDATE_CATEGORY_PROGRESS"]: Meta.NoMeta;
        ["MG:USER:SHOW_NOTES"]: Meta.Visibility;
        ["MG:USER:SET_NOTE_GROUP_VISIBILITY"]: Meta.NoteGroup & Meta.Visibility;
        ["MG:USER:CREATE_NOTE"]: Meta.Note;
        ["MG:USER:CREATE_NOTE_FULFILLED"]: Meta.Note;
        ["MG:USER:UPDATE_NOTE"]: Meta.Note;
        ["MG:USER:SELECT_NOTE"]: Meta.SelectedNote;
        ["MG:USER:EDIT_NOTE"]: Meta.EditingNote;
        ["MG:USER:SET_MOVING_NOTE"]: Meta.NoteId;
        ["MG:USER:ADD_TRACKED_CATEGORY"]: Meta.CategoryId;
        ["MG:USER:REMOVE_TRACKED_CATEGORY"]: Meta.CategoryId;
        ["MG:USER:SET_SUGGESTIONS_VISIBLE"]: Meta.Visibility;
        ["MG:USER:SET_SUGGESTION_MODE_ACTIVE"]: Meta.Active;
        ["MG:USER:ADD_SUGGESTION"]: Meta.Suggestion;
        ["MG:USER:UPDATE_SUGGESTION"]: Meta.Suggestion;
        ["MG:USER:EDIT_SUGGESTION"]: Meta.SuggestionPosition;
        ["MG:USER:DELETE_SUGGESTION"]: Meta.Suggestion;
        ["MG:USER:ADD_PRESET"]: Meta.Preset;
        ["MG:USER:UPDATE_PRESET"]: Meta.Preset;
        ["MG:USER:DELETE_PRESET"]: Meta.PresetId;
        ["MG:USER:REORDER_PRESETS"]: Meta.PresetIds;
        ["MG:USER:SHOW_ROUTES"]: Meta.Visibility;
    }

    declare interface MapStateActionsMap {
        ["MG:MAP:DELETE_NOTE"]: Meta.Note;
        ["MG:MAP:DELETE_NEW_NOTE"]: Meta.NoMeta;
        ["MG:MAP:SET_ADD_MARKER_CONTROLS_VISIBLE"]: Meta.Visibility;
        ["MG:MAP:SET_SELECTED_CATEGORY"]: Meta.SelectedCategory;
        ["MG:MAP:SET_SELECTED_GROUP"]: Meta.SelectedGroup;
        ["MG:MAP:CREATE_LOCATION"]: Meta.Location;
        ["MG:MAP:ADD_NEW_LOCATION"]: Meta.Position;
        ["MG:MAP:UPDATE_NEW_LOCATION"]: Meta.Position;
        ["MG:MAP:REMOVE_NEW_LOCATION"]: Meta.NoMeta;
        ["MG:MAP:UPDATE_LOCATION"]: Meta.Location & Meta.LocationId;
        ["MG:MAP:UPDATE_LOCATIONS"]: Meta.UpdateLocations;
        ["MG:MAP:UPDATE_LOCATION_POSITION"]: Meta.LocationId & Meta.Position;
        ["MG:MAP:UPDATE_LOCATION_FEATURES"]: Meta.LocationId & Meta.Features;
        ["MG:MAP:DELETE_LOCATION"]: Meta.Location;
        ["MG:MAP:DELETE_LOCATION_FULFILLED"]: Meta.Location;
        ["MG:MAP:SHOW_LOCATION_INFO"]: Meta.Location & Meta.Visibility;
        ["MG:MAP:SET_SELECTED_LOCATION"]: Meta.LocationId;
        ["MG:MAP:SET_IS_EDITING_MARKER"]: Meta.EditingMarker;
        ["MG:MAP:TOGGLE_CATEGORY"]: Meta.CategoryId;
        ["MG:MAP:TOGGLE_CATEGORIES"]: Meta.CategoryIds;
        ["MG:MAP:SET_CATEGORIES_VISIBILITY"]: Meta.Visibilities;
        ["MG:MAP:SHOW_ALL_CATEGORIES"]: Meta.NoMeta;
        ["MG:MAP:HIDE_ALL_CATEGORIES"]: Meta.NoMeta;
        ["MG:MAP:TOGGLE_GROUP"]: Meta.Group;
        ["MG:MAP:UPDATE_CATEGORY"]: Meta.Category;
        ["MG:MAP:UPDATE_CATEGORIES"]: Meta.Categories;
        ["MG:MAP:UPDATE_GROUP"]: Meta.Group;
        ["MG:MAP:SET_HEATMAP_CATEGORY_SELECTED"]: Meta.CategoryId & Meta.Selected;
        ["MG:MAP:UPDATE_HEATMAP_CATEGORY"]: Meta.Category;
        ["MG:MAP:SET_IS_EDITING_HEATMAP"]: Meta.EditingHeatmap;
        ["MG:MAP:SET_LOCATION_FILTER"]: Meta.LocationFilter;
        ["MG:MAP:SET_REGION_FILTER"]: Meta.RegionFilter;
        ["MG:MAP:SET_TAG_FILTERS"]: Meta.TagFilters;
        ["MG:MAP:SET_TAG_FILTERS_V2"]: Meta.TagFilters;
        ["MG:MAP:SHOW_SPECIFIC_LOCATIONS"]: Meta.LocationsIds & Meta.CategoryIds;
        ["MG:MAP:APPLY_PRESET"]: Meta.Preset & Meta.Additive;
        ["MG:MAP:UNAPPLY_PRESET"]: Meta.Preset;
        ["MG:MAP:SET_ACTIVE_PRESETS"]: Meta.ActivePresets;
        ["MG:MAP:SET_TIMERS_VISIBLE"]: Meta.Visibility;
        ["MG:MAP:SET_SELECTED_ROUTE"]: Meta.Route;
        ["MG:MAP:SET_IS_EDITING_ROUTE"]: Meta.Enabled;
        ["MG:MAP:SET_IS_ADDING_ROUTE"]: Meta.Enabled;
        ["MG:MAP:SET_IS_SAVING_ROUTE"]: Meta.SavingRoute;
        ["MG:MAP:ADD_UNSAVED_ROUTE"]: Meta.Route;
        ["MG:MAP:ADD_ROUTE"]: Meta.Route;
        ["MG:MAP:UPDATE_ROUTE"]: Meta.Route;
        ["MG:MAP:DELETE_ROUTE"]: Meta.Route;
    }

    declare interface SearchStateActionsMap {
        ["MG:SEARCH:SET_CURRENT_INPUT"]: Meta.Query;
        ["MG:SEARCH:SET_QUERY"]: Meta.Query;
        ["MG:SEARCH:SET_PREVIOUS_CATEGORIES"]: Meta.Categories;
        ["MG:SEARCH:SET_SEARCH_RESULTS"]: Meta.SearchResults;
        ["MG:SEARCH:SET_LOCATION_HIGHLIGHTED"]: Meta.LocationHighlighted;
    }
}
