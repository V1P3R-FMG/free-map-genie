import CachedValue from "@shared/cached";

const ORIGIN = __DEBUG__ ? (__OVERRIDE_SERVER_URL__ ?? `http://localhost:${__PORT__}`) : "https://mapgenie.io";

export interface Cache<T> {
    [id: string]: CachedValue<T>;
}

export class GamesService {
    private readonly games: CachedValue<MG.Api.Game[]> = this.fetch(`${ORIGIN}/api/v1/games`);
    private readonly gamesFull: Cache<MG.Api.GameFull> = {};
    private readonly mapsFull: Cache<MG.Api.MapFull> = {};
    private readonly heatmaps: Cache<MG.Api.HeatmapGroup[]> = {};

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

    public async findGameFromSlug(gameSlug: string) {
        const games = await this.getGames();
        return games.find((game) => game.slug === gameSlug);
    }

    public async findMap(gameId: number, mapId: number) {
        const game = await this.findGame(gameId);
        return game?.maps.find((map) => map.id === mapId);
    }

    public async findMapFromSlug(gameSlug: string, mapSlug: string) {
        const game = await this.findGameFromSlug(gameSlug);
        return game?.maps.find((map) => map.slug === mapSlug);
    }

    public async findGameFromDomain(domain: string) {
        domain = domain.replace(/^https:\/{2}|\/$/g, "");
        const games = await this.getGames();
        return games.find((game) => game.domain === domain);
    }

    public async findGameFromUrl(url: string) {
        const { origin, pathname } = new URL(url);
        const [_, gameSlug, __, mapSlug] = pathname.split("/");

        if (!gameSlug && !mapSlug) {
            if (origin === "https://mapgenie.io") return undefined;

            return this.findGameFromDomain(origin);
        } else if (gameSlug) {
            return this.findGameFromSlug(gameSlug);
        }
    }

    public async findMapFromUrl(url: string) {
        const { origin, pathname } = new URL(url);
        const [_, gameSlug, __, mapSlug] = pathname.split("/");

        if (!gameSlug && !mapSlug) {
            if (origin === "https://mapgenie.io") return undefined;

            const game = await this.findGameFromDomain(origin);
            if (game?.maps.length === 1) {
                return game?.maps[0];
            }
        } else if (gameSlug && mapSlug) {
            return this.findMapFromSlug(gameSlug, mapSlug);
        }
    }

    public async getGame(gameId: number) {
        this.gamesFull[gameId] ??= this.fetch(`${ORIGIN}/api/v1/games/${gameId}/full`);
        return this.gamesFull[gameId].data;
    }

    public async getMap(mapId: number) {
        this.mapsFull[mapId] ??= this.fetch(`${ORIGIN}/api/v1/maps/${mapId}/full`);
        return this.mapsFull[mapId].data;
    }

    public async getHeatmaps(mapId: number) {
        this.heatmaps[mapId] ??= this.fetch(`${ORIGIN}/api/v1/maps/${mapId}/heatmaps`);
        return this.heatmaps[mapId].data;
    }
}

export default new GamesService();
