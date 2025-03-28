import { fetch } from "@fmg/mg";
import FMG_MapData from "./map";

export default class FMG_GameData {
    private static cache: Record<Id, FMG_GameData> = {};

    public readonly game: MG.API.GameFull;

    private readonly _maps: Record<Id, FMG_MapData>;

    private constructor(game: MG.API.GameFull) {
        this.game = game;

        this._maps = Object.fromEntries(game.maps.map((map) => [map.id, new FMG_MapData(game, map)]));
    }

    public static async get(gameId: Id) {
        return (this.cache[gameId] ??= await this.fetch(gameId));
    }

    private static async fetch(gameId: Id) {
        const res = await fetch(`games/${gameId}/full`);
        const data: MG.API.GameFull = await res.json();
        return new FMG_GameData(data);
    }

    public get maps() {
        return Object.values(this._maps) as FMG_MapData[];
    }

    /**
     * Gets a specific map for a given game
     * @param mapId the map id
     * @returns the map
     */
    public getMap(mapId: Id) {
        if (!(mapId in this._maps)) {
            throw new Error(`Could not find map with id ${mapId} for game ${this.game.id}`);
        }
        return this._maps[mapId];
    }

    /**
     * Filters the given location ids, and seperates them per map.
     * @param locations the location ids to filter
     * @returns the filtered locations, seperated per map
     */
    public filterLocations(locations: Id[]): Record<Id, Id[]> {
        return Object.fromEntries(
            this.maps
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
    public filterCategories(categories: Id[]): Record<Id, Id[]> {
        return Object.fromEntries(
            this.maps
                .map((map) => [
                    map.map.id,
                    categories.filter((cat) => !!map.mapData.categories[cat])
                ])
                .filter(([_, categories]) => (categories as Id[]).length > 0)
        );
    }

    /**
     * Get the map for a given location id.
     * @param locationId the location id to get the map for
     * @returns the map for the given location id
     */
    public getMapForLocation(locationId: Id) {
        const map = this.maps.find((map) => !!map.locationsById[locationId]);
        if (!map) throw new Error("Could not find map for location");
        return map;
    }
}
