export class FMG_LocalStorageDriver implements FMG.Storage.Driver {
    private storage: Storage;

    constructor(window: Window) {
        this.storage = window.localStorage;
    }

    async init(): Promise<void> {}

    async get<T>(key: string): Promise<T | null> {
        return JSON.parse(this.storage.getItem(key) ?? "null");
    }

    async set<T>(key: string, value: T): Promise<void> {
        this.storage.setItem(key, JSON.stringify(value));
    }

    async remove(key: string): Promise<void> {
        this.storage.removeItem(key);
    }

    async clear(): Promise<void> {
        this.storage.clear();
    }

    async backup(key: string): Promise<void> {
        // TODO: implement
    }

    async keys(): Promise<string[]> {
        return Object.keys(this.storage);
    }
}
