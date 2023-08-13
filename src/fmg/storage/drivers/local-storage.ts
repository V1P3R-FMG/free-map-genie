export class LocalStorageDriver implements FMG.Storage.Driver {
    private storage: Storage;

    constructor(window: Window) {
        this.storage = window.localStorage;
    }

    init(): Promise<void> {
        return Promise.resolve();
    }

    get<T>(key: string): Promise<T | null> {
        return Promise.resolve(JSON.parse(this.storage.getItem(key) ?? "null"));
    }

    set<T>(key: string, value: T): Promise<void> {
        this.storage.setItem(key, JSON.stringify(value));
        return Promise.resolve();
    }

    remove(key: string): Promise<void> {
        this.storage.removeItem(key);
        return Promise.resolve();
    }
}
