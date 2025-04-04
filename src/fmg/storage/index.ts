import { isEmpty, isNotEmpty } from "@shared/utils";
import * as deepFilter from "deep-filter";

import { FMG_Data } from "./proto/data";
import { FMG_Drivers } from "./drivers";
import { FMG_Keys } from "./keys";

export class FMG_Storage {
    private static storages: Record<string, FMG_Storage> = {};

    public autosave: boolean = true;

    public readonly window: Window;

    public driver: FMG.Storage.Driver;

    private _keyData: FMG.Storage.KeyData;
    private _data: Record<string, FMG_Data> = {};
    private _keys?: FMG_Keys;

    public constructor(window: Window, keyData: FMG.Storage.KeyData) {
        this.window = window;
        this.driver = FMG_Drivers.newLocalStorageDriver(window);
        
        this._keyData = keyData;
        if (window.user) {
            this._data[this.keys.v2Key] = FMG_Data.create({}, () => this.save());
        }
    }

    public get data(): FMG_Data {
        if (this.window.user) {
            return this._data[this.keys.v2Key];
        }
        return FMG_Data.create({}, () => {});
    }

    public get all(): Record<string, FMG_Data> {
        return this._data;
    }

    public get keys(): FMG_Keys {
        if (!this._keys) {
            this._keys = new FMG_Keys(this._keyData);
        }
        return this._keys;
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
        const key = FMG_Keys.getV2Key(keyData);
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
        const key = FMG_Keys.getV2Key(keyData);
        if (FMG_Storage.storages[key]) {
            FMG_Storage.storages[key].save();
            delete FMG_Storage.storages[key];
        }
    }

    /**
     * The key of this storage.
     */
    public get key(): string {
        return this.keys.v2Key;
    }

    // TODO: check if loaded data is valid
    /**
     * Loads the data from the storage.
     */
    public async load(): Promise<void> {
        if (!this.window.user) return;
        if (this.window.isMini) {
            if (!this.window.mapData) throw new Error("Failed to load storage data, Mapdata is not defined.");

            await Promise.all(
                this.window.mapData.maps.map(async (map) => {
                    const key = FMG_Keys.getV2Key({
                        ...this.keys.keyData,
                        mapId: map.id
                    });
                    const data =
                        await this.driver.get<FMG.Storage.V2.StorageObject>(
                            key
                        );
                    this._data[key] = FMG_Data.create(data ?? {}, () =>
                        this.save()
                    );
                })
            );
        } else {
            const data = await this.driver.get<FMG.Storage.V2.StorageObject>(
                this.key
            );
            this._data[this.keys.v2Key] = FMG_Data.create(data ?? {}, () =>
                this.save()
            );
        }
    }

    /**
     * Saves the data to the storage.
     */
    public async save(): Promise<void> {
        if (!this.window.user) return;
        for (const [key, data] of Object.entries(this._data)) {
            // Deep filter out empty values.
            const obj = deepFilter(data, isNotEmpty);

            if (Object.values(obj).every(isEmpty)) {
                await this.driver.remove(key);
            } else {
                await this.driver.set<FMG.Storage.V2.StorageObject>(key, obj);
            }
        }
        logger.debug("Saving storage", this._data);
    }

    /**
     * Clear the data from the storage.
     */
    public async clear(): Promise<void> {
        if (!this.window.user) return;
        await this.driver.remove(this.key);
        this._data = Object.fromEntries(
            Object.entries(this._data).map(([key]) => [
                key,
                FMG_Data.create({}, () => this.save())
            ])
        );
    }
}
