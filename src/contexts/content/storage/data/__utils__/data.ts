import MemoryDriver from "@content/storage/drivers/memory.driver";
import type { DataManagersMap } from "..";

export interface JsonFormat<StorageLayout extends object> {
    // A local storage like object to test on
    storage: Record<string, StorageLayout>;

    // A map with keys and their key data
    keyDataMap: Record<string, Key>;

    // Empty data to save and see that it gets omitted
    emptyData: StorageLayout;

    // Non-Empty data to save and check against expected
    nonEmptyData: {
        data: StorageLayout;
        expected: StorageLayout;
    };

    // A key that is not in the given storage
    nonExistingKey: KeyInfo;

    // Keys that exist in storage
    keys: KeyInfo[];
}

export type DataLayouts = {
    [K in keyof DataManagersMap]: Record<string, DataManagersMap[K]>;
};

export type BackupKeys = {
    [K in keyof DataManagersMap]: {
        key: string;
        count: number;
    }[];
};

export type JsonMigrateFormat = Prettify<
    DataLayouts & {
        keys: KeyInfo[];
        backupKeys: BackupKeys;
    }
>;

export function loadStorageDriver<StorageLayout extends object>(storage: Record<string, StorageLayout>): MemoryDriver {
    return new MemoryDriver(
        Object.fromEntries(
            Object.entries(storage).map(([key, value]) => {
                return [key, JSON.stringify(value)];
            })
        )
    );
}

export function loadStorageData<StorageLayout extends object>(version: string): JsonFormat<StorageLayout> {
    return jsonService.readJson<JsonFormat<StorageLayout>>(`storage/data/${version}.json`);
}

export function loadMigrateData(version: string): JsonMigrateFormat {
    return jsonService.readJson<JsonMigrateFormat>(`storage/migrate/${version}.json`);
}

export type { default as MemoryDriver } from "@content/storage/drivers/memory.driver";
