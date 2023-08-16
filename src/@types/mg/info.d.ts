declare namespace MG {
    namespace Info {
        interface Game {
            id: number;
            title: string;
            slug: string;
            ign_slug: string;
        }

        interface User {
            id: number;
            hasPro: boolean;
            locations: Location[];
            gameLocationsCount: number;
            presets: Preset[];
            role: "user" | "admin";
            suggestions: Suggestion[];
            trackedCategoryIds: number[];
        }

        interface Map {
            id: number;
            title: string;
            slug: string;
            ign_slug?: string;
        }

        interface MapData {
            categories: DictById<Category>;
            locations: Location[];
            groups: Group[];
            map: Map;
            maps: Map[];
            presets: Preset[];
            mapConfig: MapConfig;
            regions: Region[];
        }
    }
}
