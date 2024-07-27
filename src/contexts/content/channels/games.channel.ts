import BaseChannel from "./index";

class GamesChannel extends BaseChannel {
    public async getAll(): Promise<MG.Api.Game[]> {
        return this.sendExtension({ type: "games", data: undefined });
    }

    public async getGame(gameId: number): Promise<Possible<MG.Api.Game>> {
        return this.sendExtension({ type: "game", data: { gameId } });
    }

    public async getGameMap(gameId: number, mapId: number): Promise<Possible<MG.Api.GameMap>> {
        return this.sendExtension({ type: "game:map", data: { gameId, mapId } });
    }
}

export default new GamesChannel();
