import CachedValue from "@utils/cached";

const ORIGIN = __DEBUG__ ? `http://localhost:${__PORT__}` : "https://mapgenie.io";

export interface Cache<T> {
    [id: string]: CachedValue<T>;
}

export class GamesService {
    private readonly games: CachedValue<MG.Api.Game[]> = new CachedValue(`${ORIGIN}/api/v1/games`);
    private readonly gamesFull: Cache<MG.Api.GameFull> = {};
    private readonly mapsFull: Cache<MG.Api.MapFull> = {};

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
        this.gamesFull[gameId] ??= new CachedValue(`${ORIGIN}/api/v1/games/${gameId}/full`);
        return this.gamesFull[gameId].data;
    }

    public getMap(mapId: number) {
        this.mapsFull[mapId] ??= new CachedValue(`${ORIGIN}/api/v1/maps/${mapId}/full`);
        return this.mapsFull[mapId].data;
    }
}

export default new GamesService();
