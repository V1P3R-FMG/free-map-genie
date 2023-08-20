import { FMG_Maps } from "@fmg/info/maps";
import { FMG_Storage } from "@fmg/storage";
import { LegacyDataStorage, type LegacyResult } from "./legacy";
import { isEmpty } from "@shared/utils";

export interface MigrationResult {
    [mapId: Id]: FMG.Storage.V2.StorageObject;
}

export class FMG_StorageDataMigrator {
    public readonly driver: FMG.Storage.Driver;
    public readonly legacy: LegacyDataStorage;

    private static readonly backupTime = 1000 * 60 * 60 * 24 * 7; // 7 days
    private static readonly backupRegex = /:fmg-backup:(\d+)$/;

    constructor(driver: FMG.Storage.Driver) {
        this.driver = driver;
        this.legacy = new LegacyDataStorage(driver);
    }

    /**
     * Starts the migration process
     */
    public async migrate() {
        if (!(await this.needsMigration())) {
            logger.log("No legacy data found, skipping migration");
            return;
        }

        // Should we ask the user if they want to migrate?
        /**
        const doMigration =
            window.confirm("Legacy data found!, Do you want to migrate it?") ||
            window.confirm("Are you sure you want to clear it?");
        */

        const keys = await this.legacy.keys();
        const doMigration = true;

        // If the user does not want to migrate, clear the data
        if (!doMigration) {
            logger.log("Migration declined, clearing legacy data");
            // TODO: Maybe for clear create a backup with time and only clear after a certain amount of time
            await Promise.all(keys.map(this.driver.clear));
        }

        // Migrate the data
        const data = await this.legacy.fetch();
        for (const [key, gameData] of Object.entries(data)) {
            const migratedData = await this.migrateGame(
                gameData.gameId,
                gameData
            );
            for (const [mapId, mapData] of Object.entries(migratedData || {})) {
                if (!mapData) continue;
                await this.driver.set(
                    FMG_Storage.getKey({
                        mapId,
                        gameId: gameData.gameId,
                        userId: gameData.userId
                    }),
                    mapData
                );
                await this.backupAndRemove(key);
            }
        }
    }

    /**
     * Checks if the data needs to be migrated.
     */
    public async needsMigration(): Promise<boolean> {
        return this.legacy.hasLegacyStorageObjects();
    }

    /**
     * Migrate legacy data to the new format
     * @param storage the storage to fetch the data from
     * @returns the legacy data in the new format, or null if there is no legacy data
     */
    private async migrateGame(
        gameId: Id,
        gameData: LegacyResult
    ): Promise<MigrationResult | null> {
        const maps = FMG_Maps.get(gameId);

        const locationsPerMap = await maps.filterLocations(
            gameData.global.locations ?? []
        );

        // If there is no locations data, then we probably never stored any data for this game
        if (isEmpty(locationsPerMap)) return null;

        const data: MigrationResult = {};

        for (const [mapId, locations] of Object.entries(locationsPerMap)) {
            if (isEmpty(locations)) continue;
            data[mapId] = data[mapId] ?? {};
            data[mapId].locationIds = locations.map((id) =>
                parseInt(id as string)
            );
        }

        for (const [mapId, mapData] of Object.entries(gameData.maps)) {
            data[mapId] = data[mapId] ?? {};
            data[mapId].categoryIds = (mapData.categories ?? []).map((id) =>
                parseInt(id as string)
            );
        }

        return data;
    }

    /**
     * Make backup of the data  and remove it from the storage
     */
    private async backupAndRemove(key: string): Promise<void> {
        const data = await this.driver.get(key);
        if (isEmpty(data)) return;
        await this.driver.set(`${key}:fmg-backup:${Date.now()}`, data);
        this.driver.remove(key);
    }

    /**
     * Clear backups that are older than a certain amount of time
     */
    public async clearOldBackups(): Promise<void> {
        const keys = await this.driver.keys();
        keys.forEach(async (key) => {
            const match = FMG_StorageDataMigrator.backupRegex.exec(key);
            if (!match) return;

            const time = parseInt(match[1]);
            if (isNaN(time)) {
                logger.warn("Could not parse backup time", key);
                return;
            }

            if (Date.now() - time > FMG_StorageDataMigrator.backupTime) {
                logger.warn("Clearing old backup", key);
                await this.driver.remove(key);
            }
        });
    }
}
