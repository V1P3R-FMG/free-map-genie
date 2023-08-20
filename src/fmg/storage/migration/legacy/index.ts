import { V1_FMG_Storage } from "./v1";

/**
 * Legacy format of the storage
 * Data was not stored per map, but in a single object
 */
export interface LegacyResult {
    gameId: Id;
    userId: Id;
    global: {
        locations?: Id[];
    };
    maps: DictById<{
        categories?: Id[];
    }>;
}

/**
 * Handles multiple legacy storages
 */
export class LegacyDataStorage {
    private legacyV1: V1_FMG_Storage; // Was called v5 before the rewrite

    constructor(driver: FMG.Storage.Driver) {
        this.legacyV1 = new V1_FMG_Storage(driver);
    }

    /**
     * Fetches all keys which contain legacy data
     * @returns
     */
    public async keys(): Promise<string[]> {
        return this.legacyV1.getLegacyStorageObjects();
    }

    /**
     * Checks if legacy data exists
     */
    public async hasLegacyStorageObjects(): Promise<boolean> {
        return (await this.keys()).length > 0;
    }

    /**
     * Fetch the legacy data
     * @returns
     */
    public async fetch(): Promise<Record<Id, LegacyResult>> {
        return this.legacyV1.fetch();
    }
}
