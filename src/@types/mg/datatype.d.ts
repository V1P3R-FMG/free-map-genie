declare namespace MG {
    interface Game {
        available_on_ign: boolean;
        config: {
            cdn_url: string;
            tiles_base_url?: string;
            url: string;
        };
        domain: string;
        id: number;
        ign_slug: string;
        image: string;
        logo: string;
        maps: MG.Info.Map[];
        slug: string;
        title: string;
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
        features: unknown | null;
        ign_marker_id: number | null;
        ign_page_id: number | null;
        media: Media[];
        tags: string[];
    }

    interface Category {
        id: number;
        group_id: number;
        icon: string;
        title: string;
        order: number;
        description: string | null;
        info: string | null;
        premium: boolean;
        visible: boolean;
        has_heatmap: boolean;
        template: unknown | null;
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

    interface Group {
        id: number;
        title: string;
        color: string;
        game_id: number;
        order: number;
        categories: Category[];
    }

    interface Route {}

    interface Suggestion {}

    interface Region {}

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
}
