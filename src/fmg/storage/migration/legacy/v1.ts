import { isEmpty } from "@shared/utils";
import type { LegacyResult } from ".";

export type V1_FMG_StorageObject = FMG.Storage.V1.StorageObject;

export class V1_FMG_Storage {
    private driver: FMG.Storage.Driver;
    private keys: string[] | null = null; // Cache the keys

    public static regexp = /^mg:game_(?<gameId>\d+):user_(?<userId>\d+):v5$/;

    constructor(driver: FMG.Storage.Driver) {
        this.driver = driver;
    }

    /**
     * Checks if legacy data exists
     */
    public async getLegacyStorageObjects(): Promise<string[]> {
        const keys = await this.driver.keys();
        this.keys = keys.filter((key) => V1_FMG_Storage.regexp.test(key));
        return this.keys;
    }

    /**
     * Normelize the data for all stored legacy data.
     * @returns the normelized data for each game.
     */
    public async fetch(): Promise<Record<Id, LegacyResult>> {
        if (!this.keys) await this.getLegacyStorageObjects();

        const games: Record<Id, LegacyResult> = {};

        await Promise.all(
            this.keys!.map(async (key) => {
                // normelize the data, and add it to the games object
                const { gameId, userId } =
                    V1_FMG_Storage.regexp.exec(key)!.groups!;

                // Get data and check if it is empty, If it is empty, return
                const obj = await this.driver.get<V1_FMG_StorageObject>(key);
                if (!obj || isEmpty(obj.sharedData)) return {};

                games[key] = {
                    gameId,
                    userId,
                    global: {
                        locations: Object.keys(obj.sharedData.locations)
                    },
                    maps: Object.fromEntries(
                        Object.entries(obj.mapData ?? {}).map(
                            ([mapId, data]) => [
                                mapId,
                                {
                                    categories: Object.keys(data.categories)
                                }
                            ]
                        )
                    )
                };
            })
        );

        return games;
    }
}
