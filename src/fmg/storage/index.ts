import { isEmpty } from "@shared/utils";
import { minimizedCopy } from "@shared/copy";

import { Data } from "./groups/data";

import { FMG_Drivers } from "./drivers";

type StorageObject = FMG.Storage.V2.StorageObject;

export class FMG_Storage {
    private static storages: Record<string, FMG_Storage> = {};

    public readonly window: Window;

    public readonly keyData: FMG.Storage.KeyData;

    public driver: FMG.Storage.Driver;

    public data: Data;

    public constructor(window: Window, keyData: FMG.Storage.KeyData) {
        this.window = window;
        this.keyData = keyData;

        this.driver = FMG_Drivers.newLocalStorageDriver(window);

        this.data = new Data({});
    }

    /**
     * Checks if data exists for the given key data.
     */
    public static async exists(
        window: Window,
        keyData: FMG.Storage.KeyData
    ): Promise<boolean> {
        return !isEmpty(await FMG_Storage.get(window, keyData).data);
    }

    /**
     * Gets the storage for the given key data.
     * If the storage does not exist, it will be created.
     * Else it will be loaded from the cache.
     * @param window th e window to create the storage for
     * @param keyData the key data to create the storage for
     * @returns the created or loaded storage
     */
    public static get(window: Window, keyData: FMG.Storage.KeyData) {
        const key = FMG_Storage.getKey(keyData);
        if (!FMG_Storage.storages[key]) {
            FMG_Storage.storages[key] = new FMG_Storage(window, keyData);
        }
        return FMG_Storage.storages[key];
    }

    /**
     * Removes the storage from the cache.
     * @param keyData the key to build the key from
     */
    public static unload(keyData: FMG.Storage.KeyData) {
        const key = FMG_Storage.getKey(keyData);
        if (FMG_Storage.storages[key]) {
            FMG_Storage.storages[key].save();
            delete FMG_Storage.storages[key];
        }
    }

    /**
     * Creates a key from the given key data.
     * @param keyData the key data to create the key from
     * @returns the created key
     */
    public static getKey(keyData: FMG.Storage.KeyData): string {
        return `fmg:game_${keyData.gameId}:map_${keyData.mapId}:user_${keyData.userId}`;
    }

    /**
     * The key of this storage.
     */
    public get key(): string {
        return FMG_Storage.getKey(this.keyData);
    }

    // TODO: check if loaded data is valid
    /**
     * Loads the data from the storage.
     */
    public async load(): Promise<void> {
        const data = await this.driver.get<StorageObject>(this.key);
        this.data = new Data(!isEmpty(data) ? data : {});
    }

    public async save(): Promise<void> {
        // Minimize the data, before saving it
        const obj = minimizedCopy(this.data) as StorageObject;

        if (isEmpty(obj)) {
            await this.driver.remove(this.key);
        } else {
            await this.driver.set<StorageObject>(this.key, obj);
        }
    }
}
