declare namespace MG {
    declare type RecordSet<T> = Record<T, boolean>;
    declare type RecordSetById = RecordSet<number | string>;
    declare type RecordById<T> = Record<number, T>;
    declare type RecordByStrId<T> = RecordById<string, T>;

    declare type PresetOrder = number[];

    declare type MimeType = `${string}/${string}`;

    declare type IsoDateString = `${number}-${number}-${number}T${number}:${number}:${number}.${number}Z`;

    declare type Int = number;
    declare type Float = number;
    declare type Color = string;
    declare type PrefixedColor = string;

    declare type DisplayType = "marker";

    declare interface Vector2 {
        x: Float;
        y: Float;
    }

    declare interface Vector2Int {
        x: Int;
        y: Int;
    }

    declare interface Position {
        lat: Float;
        lng: Float;
    }

    declare interface Preset {
        id: Int;
        title: string;
        order: Int;
        categories: number[];
        is_demo_preset?: boolean;
    }

    declare type UserRole = "user" | "admin";

    declare interface User {
        id: Int;
        role: UserRole;
        hasPro: boolean;
        locations: RecordSetById;
        trackedCategoryIds: number[];
        presets: MG.Preset[];
        suggestions: unknown[];
    }

    declare interface Game {
        id: Int;
        title: string;
        slug: string;
        ign_slug: string;
        mapgenie_release_date: string;
    }

    declare interface MapConfig {
        initial_zoom: Int;
        overlay: unknown;
        overzoom: boolean;
        start_lat: Float;
        start_lng: Float;
        tile_sets: TileSet[];
    }

    declare interface Map {
        id: Int;
        slug: string;
        title: string;
    }

    declare interface TileSetBound {
        x: { min: number; max: number };
        y: { min: number; max: number };
    }

    declare interface TileSet {
        bounds: Record<number, TileSetBound>;
        extension: string;
        id: Int;
        map_id: Int;
        max_zoom: Int;
        min_zoom: Int;
        name: string;
        order: Int;
        path: string;
        pattern: string;
    }

    declare interface Media {
        attribution: string;
        file_name: string;
        id: Int;
        meta: unknown;
        mime_type: MimeType;
        order: Int;
        title: string;
        type: string;
        url: string;
    }

    declare interface Group {
        id: Int;
        categories: Category[];
        color: Color;
        expandable: boolean;
        game_id: Int;
        order: Int;
        title: string;
    }

    declare interface GroupFull extends Group {
        categories: CategoryFull[];
    }

    declare interface Category {
        description: string;
        display_type: DisplayType;
        features_enabled: false;
        group_id: Int;
        has_heatmap: boolean;
        icon: string;
        id: number;
        ign_enabled: boolean;
        ign_visible: boolean;
        info: string;
        order: Int;
        premium: boolean;
        template: string;
        title: string;
        visible: boolean;
    }

    declare interface CategoryFull extends Category {
        locations: Location[];
    }

    declare interface Location {
        category: Category;
        category_id: Int;
        description: string;
        id: Int;
        ign_page_id: string;
        latitude: `${Float}`;
        longitude: `${Float}`;
        map_id: Int;
        media: Media[];
        region_id: Nullable<Int>;
        title: string;
        tags: number[];
        features: Nullable<MG.Feature[]>;
    }

    declare type GeometryCoordinate = [Float, Float];

    declare type GeometryType = "Polygon";

    declare interface Geometry {
        type: GeometryType;
        coordinates: GeometryCoordinate[];
    }

    declare interface Feature {
        id: number;
        type: "Feature";
        geometry: Geometry;
        properties: { id: number };
    }

    declare interface Region {
        id: number;
        map_id: number;
        parent_region_id: Nullable<number>;
        title: string;
        subtitle: Nullable<string>;
        order: number;
        features: Feature[];
        center_x: Nullable<Float>;
        center_y: Nullable<Float>;
    }

    declare interface Route {}

    declare type HeatmapDisplayType = "marker";

    declare interface HeatmapCategory {
        id: number;
        group_id: number;
        title: string;
        icon: string;
        display_type: HeatmapDisplayType;
        descriptions: Nullable<string>;
        has_heatmap: boolean;
        premium: boolean;
        visible: boolean;
        features_enabled: boolean;
        ign_enabled: boolean;
        ign_visible: boolean;
        order: number;
        points: Vector2[];
        info: Nullable<unknown>;
        template: Nullable<unknown>;
    }

    declare interface HeatmapGroup {
        id: number;
        game_id: number;
        title: string;
        heatmap_categories: HeatmapCategory[];
        order: number;
        color: string;
        expandable: boolean;
    }

    declare interface Note {
        id: string; // 11 chars
        title: string;
        description: string;
        color: Nullable<Color>;
        category: Nullable<number>;
        created_at: IsoDateString;
        latitude: Float;
        longitude: Float;
        map_id: Int;
        user_id: Int;
    }

    declare interface RegionStyle {
        ["text-color"]?: PrefixedColor;
        ["text-halo-color"]?: PrefixedColor;
        ["line-color"]?: PrefixedColor;
        ["line-width"]?: number;
        ["fill-color"]?: PrefixedColor;
        ["text-halo-color"]?: PrefixedColor;
    }

    declare interface MapStyles {
        lineStyles: Record<number, unknown>;
        polygonStyles: Record<number, unknown>;
        regionStyles: Record<number, RegionStyle>;
        shapeStyles: Record<number, unknown>;
        textStyles: Record<number, unknown>;
    }

    declare interface Tag {
        color: Nullable<Color>;
        game_id: Int;
        id: Int;
        title: string;
    }

    declare interface MapData {
        categories: Record<number, Category>;
        groups: Group[];
        heatmapCategories: HeatmapCategory[];
        heatmapGroups: HeatmapGroup[];
        locations: Location[];
        map: Map;
        mapConfig: MapConfig;
        maps: Map[];
        maxMarkedLocations: number;
        notes: unknown[];
        presets: Preset[];
        proCategoryLocationCounts: unknown[];
        routes: Route[];
        searchQuery: Nullable<string>;
        sharedNotes: Record<unknown, unknown>;
        styles: MapStyles;
        tags: Tag[];
        tagsById: Record<number, Tag>;
    }

    declare interface Config {
        ["3dEnabled"]: boolean;
        altMapSdk: boolean;
        cdnUrl: string;
        checklistEnabled: boolean;
        copyrightFooterEnabled: boolean;
        gameUrl: string;
        gridEnabled: boolean;
        iconSizeToggleEnabled: boolean;
        linkLinesEnabled: boolean;
        mapStyle: unknown;
        newSuggestionsEnabled: boolean;
        presetsEnabled: boolean;
        proOnlyMedia: boolean;
        regionLocationFocusEnabled: boolean;
        regionSelectorEnabled: boolean;
        routesEnabled: boolean;
        showRegionsInInfoWindow: boolean;
        suggestionEnabled: boolean;
        v2popupEnabled: boolean;
    }
}
