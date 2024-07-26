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

        declare interface LocatiosIds {
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

    declare interface UserStateActionsMap {
        [StateUserAction.INITIALIZE]: Meta.Initialize;
        [StateUserAction.MARK_LOCATION]: Meta.Location & Meta.Found;
        [StateUserAction.MARK_LOCATIONS]: Meta.LocationIds & Meta.Found;
        [StateUserAction.UPDATE_FOUND_LOCATIONS_COUNT]: Meta.Count;
        [StateUserAction.UPDATE_CATEGORY_PROGRESS]: Meta.NoMeta;
        [StateUserAction.SHOW_NOTES]: Meta.Visibility;
        [StateUserAction.SET_NOTE_GROUP_VISIBILITY]: Meta.NoteGroup & Meta.Visibility;
        [StateUserAction.CREATE_NOTE]: Meta.Note;
        [StateUserAction.CREATE_NOTE_FULFILLED]: Meta.Note;
        [StateUserAction.UPDATE_NOTE]: Meta.Note;
        [StateUserAction.SELECT_NOTE]: Meta.SelectedNote;
        [StateUserAction.EDIT_NOTE]: Meta.EditingNote;
        [StateUserAction.SET_MOVING_NOTE]: Meta.NoteId;
        [StateUserAction.ADD_TRACKED_CATEGORY]: Meta.CategoryId;
        [StateUserAction.REMOVE_TRACKED_CATEGORY]: Meta.CategoryId;
        [StateUserAction.SET_SUGGESTIONS_VISIBLE]: Meta.Visibility;
        [StateUserAction.SET_SUGGESTION_MODE_ACTIVE]: Meta.Active;
        [StateUserAction.ADD_SUGGESTION]: Meta.Suggestion;
        [StateUserAction.UPDATE_SUGGESTION]: Meta.Suggestion;
        [StateUserAction.EDIT_SUGGESTION]: Meta.SuggestionPosition;
        [StateUserAction.DELETE_SUGGESTION]: Meta.Suggestion;
        [StateUserAction.ADD_PRESET]: Meta.Preset;
        [StateUserAction.UPDATE_PRESET]: Meta.Preset;
        [StateUserAction.DELETE_PRESET]: Meta.PresetId;
        [StateUserAction.REORDER_PRESETS]: Meta.PresetIds;
        [StateUserAction.SHOW_ROUTES]: Meta.Visibility;
    }

    declare interface MapStateActionsMap {
        [StateMapAction.DELETE_NOTE]: Meta.Note;
        [StateMapAction.DELETE_NEW_NOTE]: Meta.NoMeta;
        [StateMapAction.SET_ADD_MARKER_CONTROLS_VISIBLE]: Meta.Visibility;
        [StateMapAction.SET_SELECTED_CATEGORY]: Meta.SelectedCategory;
        [StateMapAction.SET_SELECTED_GROUP]: Meta.SelectedGroup;
        [StateMapAction.CREATE_LOCATION]: Meta.Location;
        [StateMapAction.ADD_NEW_LOCATION]: Meta.Position;
        [StateMapAction.UPDATE_NEW_LOCATION]: Meta.Position;
        [StateMapAction.REMOVE_NEW_LOCATION]: Meta.NoMeta;
        [StateMapAction.UPDATE_LOCATION]: Meta.Location & Meta.LocationId;
        [StateMapAction.UPDATE_LOCATIONS]: Meta.UpdateLocations;
        [StateMapAction.UPDATE_LOCATION_POSITION]: Meta.LocationId & Meta.Position;
        [StateMapAction.UPDATE_LOCATION_FEATURES]: Meta.LocationId & Meta.Features;
        [StateMapAction.DELETE_LOCATION]: Meta.Location;
        [StateMapAction.DELETE_LOCATION_FULFILLED]: Meta.Location;
        [StateMapAction.SHOW_LOCATION_INFO]: Meta.Location & Meta.Visibility;
        [StateMapAction.SET_SELECTED_LOCATION]: Meta.LocationId;
        [StateMapAction.SET_IS_EDITING_MARKER]: Meta.EditingMarker;
        [StateMapAction.TOGGLE_CATEGORY]: Meta.CategoryId;
        [StateMapAction.TOGGLE_CATEGORIES]: Meta.CategoryIds;
        [StateMapAction.SET_CATEGORIES_VISIBILITY]: Meta.Visibilities;
        [StateMapAction.SHOW_ALL_CATEGORIES]: Meta.NoMeta;
        [StateMapAction.HIDE_ALL_CATEGORIES]: Meta.NoMeta;
        [StateMapAction.TOGGLE_GROUP]: Meta.Group;
        [StateMapAction.UPDATE_CATEGORY]: Meta.Category;
        [StateMapAction.UPDATE_CATEGORIES]: Meta.Categories;
        [StateMapAction.UPDATE_GROUP]: Meta.Group;
        [StateMapAction.SET_HEATMAP_CATEGORY_SELECTED]: Meta.CategoryId & Meta.Selected;
        [StateMapAction.UPDATE_HEATMAP_CATEGORY]: Meta.Category;
        [StateMapAction.SET_IS_EDITING_HEATMAP]: Meta.EditingHeatmap;
        [StateMapAction.SET_LOCATION_FILTER]: Meta.LocationFilter;
        [StateMapAction.SET_REGION_FILTER]: Meta.RegionFilter;
        [StateMapAction.SET_TAG_FILTERS]: Meta.TagFilters;
        [StateMapAction.SET_TAG_FILTERS_V2]: Meta.TagFilters;
        [StateMapAction.SHOW_SPECIFIC_LOCATIONS]: Meta.LocatiosIds & Meta.CategoryIds;
        [StateMapAction.APPLY_PRESET]: Meta.Preset & Meta.Additive;
        [StateMapAction.UNAPPLY_PRESET]: Meta.Preset;
        [StateMapAction.SET_ACTIVE_PRESETS]: Meta.ActivePresets;
        [StateMapAction.SET_TIMERS_VISIBLE]: Meta.Visibility;
        [StateMapAction.SET_SELECTED_ROUTE]: Meta.Route;
        [StateMapAction.SET_IS_EDITING_ROUTE]: Meta.Enabled;
        [StateMapAction.SET_IS_ADDING_ROUTE]: Meta.Enabled;
        [StateMapAction.SET_IS_SAVING_ROUTE]: Meta.SavingRoute;
        [StateMapAction.ADD_UNSAVED_ROUTE]: Meta.Route;
        [StateMapAction.ADD_ROUTE]: Meta.Route;
        [StateMapAction.UPDATE_ROUTE]: Meta.Route;
        [StateMapAction.DELETE_ROUTE]: Meta.Route;
    }

    declare interface SearchStateActionsMap {
        [StateSearchAction.SET_CURRENT_INPUT]: Meta.Query;
        [StateSearchAction.SET_QUERY]: Meta.Query;
        [StateSearchAction.SET_PREVIOUS_CATEGORIES]: Meta.Categories;
        [StateSearchAction.SET_SEARCH_RESULTS]: Meta.SearchResults;
        [StateSearchAction.SET_LOCATION_HIGHLIGHTED]: Meta.LocationHighlighted;
    }
}
