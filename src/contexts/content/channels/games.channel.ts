import BaseChannel from "./base.channel";

class GamesChannel extends BaseChannel {
    public async getAll(timeout?: number) {
        return this.sendBackground("games", {}, timeout);
    }

    public async findGame(gameId: number, timeout?: number) {
        return this.sendBackground("games:find:game", { gameId }, timeout);
    }

    public async findMap(gameId: number, mapId: number, timeout?: number) {
        return this.sendBackground("games:find:map", { gameId, mapId }, timeout);
    }

    public async getGame(gameId: number, timeout?: number) {
        return this.sendBackground("game", { gameId }, timeout);
    }

    public async getMap(mapId: number, timeout?: number) {
        return this.sendBackground("map", { mapId }, timeout);
    }

    public async getHeatmaps(mapId: number, timeout?: number) {
        return this.sendBackground("heatmaps", { mapId }, timeout);
    }
}

export default new GamesChannel();
