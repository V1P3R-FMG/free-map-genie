declare namespace MG.Api {
    declare type Url = string;

    declare interface IGNMeta {
        ign_meta_title: Nullable<string>;
        ign_meta_description: Nullable<string>;
    }

    declare interface MetaBase {
        meta_title: Nullable<string>;
        meta_description: Nullable<string>;
    }

    declare interface MetaAll extends MetaBase {
        meta_keywords: string;
        meta_twitter_share_text: string;
    }

    declare interface GameConfig {
        cdn_url: Url;
        tiles_base_url: Url;
        url: Url;
        presets_enabled: boolean;
        marker_sprite_url: Url;
        compass_enabled: boolean;
        heatmaps_enabled: boolean;
        show_tags: boolean;
        default_tracked_category_id: Nullable<number>;
    }

    declare interface GameMap extends IGNMeta, MetaBase {
        id: number;
        game_id: number;
        title: string;
        slug: string;
        image: Nullable<string>;
        order: number;
        enabled: boolean;
        available: boolean;
        work_in_progress: boolean;
        premium: boolean;
        initial_zoom: number;
        initial_latitude: number;
        initial_longitude: number;
        locations_count: number;
        map_style: Nullable<unknown>;
        ign_slugs: string[];
    }

    declare interface Game extends IGNMeta, MetaAll {
        id: number;
        title: string;
        domain: string;
        slug: string;
        ign_slug: string;
        availible_on_ign: boolean;
        status: string;
        order: number;
        mapgenie_release_date: MG.IsoDateString;
        default_tracked_category_id: Nullable<number>;
        series_id: number;
        series_order: number;
        home_title: Nullable<string>;
        locations_count: number;
        config: GameConfig;
        image: Url;
        logo: Url;
        maps: GameMap[];
    }
}
