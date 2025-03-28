declare namespace MG {
    namespace API {
        interface GameTag {
            id: number;
            game_id: number;
            title: string;
            color: string | null;
        }

        interface GameConfig {
            cdn_url: string;
            tiles_base_url: string;
            url: string;
            presets_enabled: boolean;
            marker_sprite_url: string;
            compass_enabled: boolean;
            heatmaps_enabled: boolean;
            show_tags: boolean;
            default_tracked_category_id: unknown | null;
        }

        interface Game {
            id: number;
            title: string;
            domain: string;
            slug: string;
            ign_slug: string;
            available_on_ign: boolean;
            status: string;
            order: number;
            mapgenie_release_date: string;
            default_tracked_category_id: unknown | null;
            series_id: number;
            series_order: number;
            home_title: string | null;
            meta_title: string;
            meta_description: string;
            meta_keywords: string;
            meta_twitter_share_text: string;
            ign_meta_title: string | null;
            ign_meta_description: string | null;
            locations_count: number;
            config: GameConfig;
            image: string;
            logo: string;
            maps: Map[];
        }

        interface GameFull extends Omit<Game, "maps"> {
            tags: GameTag[];
            default_presets: MG.Preset[];
            maps: MapFull[];
        }

        interface TileSetBound {
            x: { max: number; min: number };
            y: { max: number; min: number };
        }

        interface TileSetFull {
            id: number;
            map_id: number;
            name: string;
            path: string;
            extension: string;
            pattern: string;
            min_zoom: number;
            max_zoom: number;
            order: number;
            bounds: Record<number, TileSetBound>;
        }

        interface MapConfig {
            tile_sets: MG.TileSet[];
            initial_zoom: number;
            start_lat: number;
            start_lng: number;
            overlay: unknown | null;
            overzoom: false;
        }

        interface Location extends Omit<MG.Location, 
            | "latitude"
            | "longitude"
            | "ign_page_id"
            | "features"
            | "category"> {
                features?: MG.Feature[];
                latitude: string;
                longitude: string;
            }

        interface Category extends Omit<MG.Category, "info"> {
            info: undefined;
            locations: Location[];
        }

        interface Group extends Omit<MG.Group, "categories"> {
            categories: Category[];
        }

        interface Polygon {
            path: { lat: string; lng: string; }[]
        }

        interface Region extends Omit<MG.Region, "features"> {
            polygon: Polygon | null;
            subregions: MG.Region[];
        }

        interface Map {
            id: number;
            game_id: number;
            title: string;
            slug: string;
            image: string | null;
            order: number;
            enabled: boolean;
            available: boolean;
            work_in_progress: boolean;
            premium: boolean;
            initial_zoom: number;
            initial_latitude: number;
            initial_longitude: number;
            meta_title: string | null;
            meta_description: string | null;
            ign_meta_title: string | null;
            ign_meta_description: string | null;
            locations_count: number;
            map_style: unknown | null;
            ign_slugs: string[];
        }

        interface MapFull extends Map {
            config: MapConfig;
            url: string;
            regions: Region[];
            groups: Group[];
        }

        
        interface HeatmapGroup extends Omit<MG.HeatmapGroup, "heatmap_categories"> {
            categories: HeatmapCategory[];
        }

        interface HeatmapCategory extends MG.HeatmapCategory {}

        type Heatmaps = HeatmapGroup[];
    }
}