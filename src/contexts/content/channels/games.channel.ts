import BaseChannel from "./base.channel";

class GamesChannel extends BaseChannel {
    public async getAll(): Promise<MG.Api.Game[]> {
        return this.sendExtension({ type: "games", data: undefined });
    }

    public async findGame(gameId: number): Promise<Possible<MG.Api.Game>> {
        return this.sendExtension({ type: "games:find:game", data: { gameId } });
    }

    public async findMap(gameId: number, mapId: number): Promise<Possible<MG.Api.Map>> {
        return this.sendExtension({ type: "games:find:map", data: { gameId, mapId } });
    }

    public async getGame(gameId: number): Promise<MG.Api.GameFull> {
        return this.sendExtension({ type: "game", data: { gameId } });
    }

    public async getMap(mapId: number): Promise<MG.Api.MapFull> {
        return this.sendExtension({ type: "map", data: { mapId } });
    }

    public async getHeatmaps(mapId: number): Promise<MG.Api.HeatmapGroup[]> {
        return this.sendExtension({ type: "heatmaps", data: { mapId } });
    }
}

export default new GamesChannel();
