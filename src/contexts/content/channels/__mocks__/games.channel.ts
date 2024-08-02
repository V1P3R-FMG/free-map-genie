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

    public async getGame(_gameId: number): Promise<MG.Api.GameFull> {
        throw "No mock implemented";
    }

    public async getMap(mapId: number): Promise<MG.Api.MapFull> {
        const file = `maps/map_${mapId}.json`;
        if (!fsService.fileExists(file)) throw `Map json for map_id ${mapId} does not exists.`;
        return jsonService.readJsonAsync(file);
    }
}

export default new GamesChannel();
