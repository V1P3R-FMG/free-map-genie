import CachedValue from "@shared/cached";

const ORIGIN = __DEBUG__ ? `http://localhost:${__PORT__}` : "https://mapgenie.io";

export interface Cache<T> {
    [id: string]: CachedValue<T>;
}

export class GamesService {
    private readonly games: CachedValue<MG.Api.Game[]> = this.fetch(`${ORIGIN}/api/v1/games`);
    private readonly gamesFull: Cache<MG.Api.GameFull> = {};
    private readonly mapsFull: Cache<MG.Api.MapFull> = {};
    private readonly heatmaps: Cache<MG.Api.Heatmaps> = {};

    private fetch<T>(url: string) {
        const k = /* @mangle */ "X-Api-Secret"; /* @/mangle */
        const v = /* @mangle */ __GLOBAL__API__; /* @/mangle */
        const o = /* @mangle */ "headers"; /* @/mangle */
        return new CachedValue<T>(url, { [o]: { [k]: v } });
    }

    public getGames() {
        return this.games.data;
    }

    public async findGame(gameId: number) {
        const games = await this.getGames();
        return games.find((game) => game.id === gameId);
    }

    public async findMap(gameId: number, mapId: number) {
        const game = await this.findGame(gameId);
        return game?.maps.find((map) => map.id === mapId);
    }

    public getGame(gameId: number) {
        if (!__DEBUG__) throw "This is not allowed in production builds";
        this.gamesFull[gameId] ??= this.fetch(`${ORIGIN}/api/v1/games/${gameId}/full`);
        return this.gamesFull[gameId].data;
    }

    public getMap(mapId: number) {
        this.mapsFull[mapId] ??= this.fetch(`${ORIGIN}/api/v1/maps/${mapId}/full`);
        return this.mapsFull[mapId].data;
    }

    public getHeatmaps(mapId: number) {
        this.heatmaps[mapId] ??= this.fetch(`${ORIGIN}/api/v1/maps/${mapId}/heatmaps`);
        return this.heatmaps[mapId].data;
    }
}

export default new GamesService();
