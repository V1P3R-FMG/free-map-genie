import { isEmpty, isNotEmpty } from "@shared/utils";
import * as deepFilter from "deep-filter";

import { FMG_Data } from "./proto/data";
import { FMG_Drivers } from "./drivers";

export class FMG_Storage {
    private static storages: Record<string, FMG_Storage> = {};

    public autosave: boolean = true;

    public readonly window: Window;
    public readonly keyData: FMG.Storage.KeyData;

    public driver: FMG.Storage.Driver;
    public data: FMG_Data;

    public constructor(window: Window, keyData: FMG.Storage.KeyData) {
        this.window = window;
        this.keyData = keyData;

        this.driver = FMG_Drivers.newLocalStorageDriver(window);

        this.data = FMG_Data.create({}, () => this.save());
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
        const data = await this.driver.get<FMG.Storage.V2.StorageObject>(
            this.key
        );
        this.data = FMG_Data.create(data ?? {}, () => this.save());
    }

    /**
     * Saves the data to the storage.
     */
    public async save(): Promise<void> {
        logger.debug("Saving storage", this.key);

        // Deep filter out empty values.
        const obj = deepFilter(this.data, isNotEmpty);

        if (isEmpty(obj)) {
            await this.driver.remove(this.key);
        } else {
            await this.driver.set<FMG.Storage.V2.StorageObject>(this.key, obj);
        }
    }
}
