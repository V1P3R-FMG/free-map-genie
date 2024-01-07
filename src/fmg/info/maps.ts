import { FMG_MapData } from "./map-data";
import { FMG_Games } from "./games";

export interface FilterResult<T> {
    gameId: number;
    mapId: number;
    data: T[];
}

export class FMG_Maps {
    private static games: Record<Id, FMG_Maps> = {};

    private gameId: Id;
    private data: Record<Id, FMG_MapData>;

    private constructor(gameId: Id) {
        this.gameId = gameId;
        this.data = {};
    }

    /**
     * Gets a FMG_Maps instance for the given game id.
     * @param gameId the game id to get the FMG_Maps instance for
     * @returns the FMG_Maps instance
     */
    public static forGame(gameId: Id): FMG_Maps {
        if (!FMG_Maps.games[gameId]) {
            FMG_Maps.games[gameId] = new FMG_Maps(gameId);
        }
        return FMG_Maps.games[gameId];
    }

    /**
     * Get all the maps for a given game.
     * @returns all the maps for a given game
     */
    public async all(): Promise<FMG_MapData[]> {
        // Check if the current game is the game we are looking for
        const isCurrentGame = window.game?.id == this.gameId;

        // If we are looking for the current game.
        // Use the window.mapData, else use the FMG_Games
        // This is done to prevent loading all the games, if we only need the current game
        const maps = isCurrentGame
            ? window.mapData?.maps
            : (await FMG_Games.get(this.gameId)).maps;

        if (!maps) throw new Error("Could not find maps");

        return await Promise.all(
            maps.map(async (map) => await this.get(map.id)) ?? []
        );
    }

    /**
     * Gets the map data for the given map id.
     * @param mapId the map id to get the data for
     * @returns the map data
     */
    public async get(mapId: number): Promise<FMG_MapData> {
        if (!this.data[mapId]) {
            this.data[mapId] = await FMG_MapData.get(mapId);
        }
        return this.data[mapId];
    }

    /**
     * Filters the given location ids, and seperates them per map.
     * @param locations the location ids to filter
     * @returns the filtered locations, seperated per map
     */
    public async filterLocations(locations: Id[]): Promise<Record<Id, Id[]>> {
        const maps = await this.all();
        return Object.fromEntries(
            maps
                .map((map) => [
                    map.map.id,
                    locations.filter((loc) => !!map.locationsById[loc])
                ])
                .filter(([_, locations]) => (locations as Id[]).length > 0)
        );
    }

    /**
     * Filters the given category ids, and seperates them per map.
     * @param categories the category ids to filter
     * @returns the filtered categories, seperated per map
     */
    public async filterCategories(categories: Id[]): Promise<Record<Id, Id[]>> {
        const maps = await this.all();
        return Object.fromEntries(
            maps
                .map((map) => [
                    map.map.id,
                    categories.filter((cat) => !!map.categories[cat])
                ])
                .filter(([_, categories]) => (categories as Id[]).length > 0)
        );
    }

    /**
     * Get the map for a given location id.
     * @param locationId the location id to get the map for
     * @returns the map for the given location id
     */
    public async getMapForLocation(locationId: Id): Promise<FMG_MapData> {
        const maps = await this.all();
        const map = maps.find((map) => !!map.locationsById[locationId]);
        if (!map) throw new Error("Could not find map for location");
        return map;
    }
}
