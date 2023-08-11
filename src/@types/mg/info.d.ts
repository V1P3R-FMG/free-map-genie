declare namespace MG {
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
        presets: Preset[];
        role: keyof ["user"];
        suggestion: Suggestion[];
        trackedCategoriesIds: number[];
    }
}
