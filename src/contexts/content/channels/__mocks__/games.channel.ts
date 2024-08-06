class GamesChannel {
    public async getAll(): Promise<MG.Api.Game[]> {
        throw "No mock implemented";
    }

    public async findGame(_gameId: number): Promise<Possible<MG.Api.Game>> {
        throw "No mock implemented";
    }

    public async findMap(_gameId: number, _mapId: number): Promise<Possible<MG.Api.Map>> {
        throw "No mock implemented";
    }

    public async getGame(gameId: number): Promise<MG.Api.GameFull> {
        const file = `games/game_${gameId}.json`;
        if (!fsService.fileExists(file)) throw `Game json for gameId ${gameId} does not exists.`;
        return jsonService.readJsonAsync(file);
    }

    public async getMap(mapId: number): Promise<MG.Api.MapFull> {
        const file = `maps/map_${mapId}.json`;
        if (!fsService.fileExists(file)) throw `Map json for mapId ${mapId} does not exists.`;
        return jsonService.readJsonAsync(file);
    }
}

export default new GamesChannel();
