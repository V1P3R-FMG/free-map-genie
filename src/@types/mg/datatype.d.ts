declare namespace MG {
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
        categroty: Category | null;
        color: string | null;
        description: string;
        latitude: string;
        longitude: string;
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
}
