declare namespace MG {
    interface Group {
        id: number;
        game_id: number;
        title: string;
        order: number;
        color: string;
        expandable: boolean;
        categories: Category[];
    }

    interface Category {
        id: number;
        group_id: number;
        title: string;
        icon: string;
        template: unknown | null;
        order: number;
        has_heatmap: boolean;
        features_enabled: boolean;
        display_type: string;
        ign_enabled: boolean;
        ign_visible: boolean;
        visible: boolean;
        description: string | null;
        info: string | null;
        premium: boolean;
    }

    interface Location {
        id: number;
        map_id: number;
        region_id: number;
        category_id: number;
        category: Category;
        title: string;
        description: string | null;
        latitude: number;
        longitude: number;
        tags: string[];
        media: Media[];
        features: MG.Feature[] | null;
        ign_page_id: number | null;
    }

    type PresetOrder = number[];

    interface Preset {
        id: number;
        title: string;
        is_demo_preset?: boolean;
        order: number;
        categories: number[];
    }

    interface Note {
        id: string;
        category: Category | null;
        color: string | null;
        description: string;
        latitude: string | number;
        longitude: string | number;
        map_id: number;
        title: string;
        user_id: number;
    }

    interface Route {}

    interface Suggestion {}

    interface Geometry {
        type: string;
        coordinates: [number, number][];
    }

    interface Feature {
        type: "Feature";
        id: Id;
        geometry: Geometry;
        properties: Record<string, any>;
    }

    interface Region {
        id: number;
        map_id: number;
        parent_region_id: number | null;
        title: string;
        subtitle: string | null;
        features: Feature[] | null;
        center_x: string;
        center_y: string;
        order: number;
    }

    interface Media {
        id: number;
        file_name: string;
        url: string;
        title: string;
        order: number;
        type: keyof ["image"];
        mime_type: ["image/png"];
        attribution: string;
        meta: unknown | null;
    }

    interface TileSet {
        extension: string;
        max_zoom: number;
        min_zoom: number;
        name: string;
        path: string;
        pattern: string;
    }

    interface MapConfig {
        initial_zoom: number;
        overlay: unknown | null;
        overzoom: boolean;
        start_lat: number;
        start_lng: number;
        tile_sets: TileSet[];
    }

    interface GameConfig {
        cdn_url: string;
        compass_enabled: boolean;
        marker_sprite_url: string;
        presets_enabled: boolean;
        tiles_base_url: string;
        url: string;
    }

    interface Point {
        x: string;
        y: string;
    }

    interface HeatmapCategory {
        id: number;
        group_id: number;
        title: string;
        icon: string;
        info: unknown | null;
        template: unknown | null;
        order: number;
        has_heatmap: boolean;
        features_enabled: boolean;
        display_type: string;
        ign_enabled: boolean;
        ign_visible: boolean;
        visible: boolean;
        description: string | null;
        premium: boolean;
        points: Point[];
    }

    interface HeatmapGroup {
        id: number;
        game_id: number;
        title: string;
        order: number;
        color: string;
        expandable: boolean;
        heatmap_categories: HeatmapCategory[];
    }
}
