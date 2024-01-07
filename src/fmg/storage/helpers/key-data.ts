import { checkDefined } from "@shared/utils";

export class FMG_KeyDataHelper {
    /**
     * Creates key data from the given window.
     * @param window the window to create the key data from
     * @param mapId the mapId to use
     * @returns the created key data
     */
    static fromWindow(window: Window): FMG.Storage.KeyData {
        return {
            mapId: checkDefined(
                window.mapData?.map.id,
                "window.mapData.map.id"
            ),
            gameId: checkDefined(window.game?.id, "window.game.id"),
            userId: checkDefined(window.user?.id, "window.user.id")
        };
    }

    /**
     * Creates key data from the given window and mapId.
     * @param window the window to create the key data from
     * @param mapId the mapId to use
     * @returns the created key data
     */
    static fromWindowAndMap(
        window: Window,
        mapId: number
    ): FMG.Storage.KeyData {
        return {
            mapId,
            gameId: checkDefined(window.game?.id, "window.game.id"),
            userId: checkDefined(window.user?.id, "window.user.id")
        };
    }

    /**
     * Creates key data from the given window and userId.
     * @param window the window to create the key data from
     * @param userId the userId to use
     * @returns the created key data
     */
        static fromWindowAndUser(
            window: Window,
            userId: number
        ): FMG.Storage.KeyData {
            return {
                mapId: checkDefined(
                    window.mapData?.map.id,
                    "window.mapData.map.id"
                ),
                gameId: checkDefined(window.game?.id, "window.game.id"),
                userId
            };
        }
}
