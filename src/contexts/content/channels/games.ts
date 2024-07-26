import { Channels } from "@constants";
import Channel from "@shared/channel";

class GamesChannel {
    private readonly channel = Channel.window(Channels.Content);

    public async has(key: string): Promise<string> {
        return this.channel.send(Channels.Extension, {
            type: "has",
            data: { key },
        });
    }

    public async getAll(): Promise<MG.Api.Game[]> {
        return this.channel.send(Channels.Extension, {
            type: "games",
        });
    }

    public async getGame(gameId: number): Promise<Possible<MG.Api.Game>> {
        return this.channel.send(Channels.Extension, {
            type: "game",
            data: { gameId },
        });
    }

    public async getGameMap(gameId: number, userId: number): Promise<Possible<MG.Api.GameMap>> {
        return this.channel.send(Channels.Extension, {
            type: "game:map",
            data: { gameId, userId },
        });
    }
}

export default new GamesChannel();
