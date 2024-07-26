import { Channels } from "@constants";
import Channel from "@shared/channel";
import { getContext } from "@shared/context";

export default class Games {
    private static async send(type: string, gameId?: number, userId?: number) {
        const payload = {
            type,
            data: { gameId, userId },
        };

        switch (getContext()) {
            case "main":
                return Channel.window(Channels.Content).send(Channels.Extension, payload);
            case "extension":
                return chrome.runtime.sendMessage(payload);
            case "sub":
                throw "Invalid context";
        }
    }

    public static async getAll(): Promise<MG.Api.Game[]> {
        return this.send("games");
    }

    public static async getGame(gameId: number): Promise<MG.Api.Game | null> {
        return this.send("game", gameId);
    }

    public static async getGameMap(gameId: number, userId: number): Promise<MG.Api.GameMap | null> {
        return this.send("game::map", gameId, userId);
    }
}
