import DataManager, { type LatestData } from "@content/storage/data/index";

import StorageFilter from "@shared//storage-filter";

import WindowStorageDriver from "@content/storage/drivers/window.driver";
import IframeStorageDriver from "@content/storage/drivers/iframe.driver";
import Key from "@content/storage/key";

export interface Updater {
    (data: LatestData): Promise<any> | any;
}

class StorageService {
    private readonly rememberCategoriesRegex =
        /mg:settings:game_(?<gameId>\d+):visible_categories:id_(?<categoryId>\d+)/;

    private readonly localStorage = new DataManager(new WindowStorageDriver());
    private readonly iframeStorage = new DataManager(new IframeStorageDriver());

    private readonly cache: Record<string, LatestData> = {};

    /** Migrates data from localstorage to iframestorage  */
    private async migrate(key: Key) {
        // We don't need to migrate as the iframe storage is located at this domain
        if (window.location.origin === "https://mapgenie.io") return;

        // We don't want to accidentally override current data with old data.
        if (await this.iframeStorage.has(key)) return;

        if (await this.localStorage.has(key)) {
            const data = await this.localStorage.load(key);
            await this.iframeStorage.save(key, data);
            await this.localStorage.backup(
                this.localStorage.current.version,
                this.localStorage.current.backupKeys(key)
            );
            await this.localStorage.remove(key);
        }
    }

    public loadFromCache(key: Key): LatestData | undefined {
        return this.cache[`${key}`];
    }

    public removeFromCache(key: Key) {
        delete this.cache[`${key}`];
    }

    public async has(key: Key) {
        return this.iframeStorage.has(key);
    }

    public async load(key: Key) {
        if (!this.cache[`${key}`]) {
            await this.migrate(key);
            this.cache[`${key}`] = await this.iframeStorage.load(key);
        }
        return this.cache[`${key}`];
    }

    public async save(key: Key) {
        if (!this.cache[`${key}`]) {
            logging.warn("Tried to save data that is not loaded.", key);
            return;
        }
        this.cache[`${key}`].latestUpdate = Date.now();
        await this.iframeStorage.save(key, this.cache[`${key}`]);
    }

    public async remove(key: Key) {
        delete this.cache[`${key}`];
        await this.iframeStorage.remove(key);
    }

    public async update(key: Key, updater: Updater) {
        const data = await this.load(key);
        await updater(data);
        await this.save(key);
    }

    public async installFilter() {
        const filter = StorageFilter.install(window);

        filter.registerFilter<["gameId", "categoryId"]>(
            "get",
            this.rememberCategoriesRegex,
            (_storage, _action, _key, _value, { categoryId }, block) => {
                block();
                const data = this.loadFromCache(Key.fromWindow(window));
                return data?.visibleCategories[categoryId!] ? "true" : undefined;
            }
        );

        filter.registerFilter<["gameId", "categoryId"]>(
            "set",
            this.rememberCategoriesRegex,
            (_storage, _action, _key, _value, { categoryId }, block) => {
                block();
                const data = this.loadFromCache(Key.fromWindow(window));
                if (data) {
                    data.visibleCategories.add(categoryId!);
                    this.save(Key.fromWindow(window)).catch(logging.error);
                }
            }
        );

        filter.registerFilter<["gameId", "categoryId"]>(
            "remove",
            this.rememberCategoriesRegex,
            (_storage, _action, _key, _value, { categoryId }, block) => {
                block();
                const data = this.loadFromCache(Key.fromWindow(window));
                if (data) {
                    data.visibleCategories.delete(categoryId!);
                    this.save(Key.fromWindow(window)).catch(logging.error);
                }
            }
        );
    }
}

export default new StorageService();
