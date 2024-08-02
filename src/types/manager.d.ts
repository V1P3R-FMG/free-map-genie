type Key = import("../contexts/content/storage/key").default;

interface BackupKey {
    key: string;
    backupKey: string;
}

declare interface KeyInfo {
    key: string;
    keyData: Key;
}

declare interface DataManagerImpl<T = any, DM extends DataManagerImpl<any, any> | void = any> {
    version: number;

    has(key: Key): Promise<boolean>;

    key(key: string): Promise<Key | null>;

    save(key: Key, data: T): Promise<void>;
    load(key: Key): Promise<T>;

    remove(key: Key): Promise<void>;

    upgrade(data: DM, key: Key): Promise<void>;

    backupKeys(key: Key): BackupKey[];

    keys(): Promise<KeyInfo[]>;
}
