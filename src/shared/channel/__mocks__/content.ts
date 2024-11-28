const background = {
    async getGame({ gameId }: { gameId: number }): Promise<MG.Api.GameFull> {
        const file = `games/game_${gameId}.json`;
        if (!fsService.fileExists(file)) throw `Game json for gameId ${gameId} does not exists.`;
        return jsonService.readJsonAsync(file);
    },

    async getMap({ mapId }: { mapId: number }): Promise<MG.Api.MapFull> {
        const file = `maps/map_${mapId}.json`;
        if (!fsService.fileExists(file)) throw `Map json for mapId ${mapId} does not exists.`;
        return jsonService.readJsonAsync(file);
    },
};

export default {
    background,
};
