declare interface Driver {
    has(key: string): Promise<boolean>;
    get(key: string): Promise<Nullable<string>>;
    set(key: string, value: string): Promise<void>;
    remove(key: string): Promise<void>;
    keys(): Promise<string[]>;
}
