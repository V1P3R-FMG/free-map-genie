declare namespace FMG {
    namespace Storage {
        interface Driver {
            init(...any: any[]): Promise<void>;
            get<T>(key: string): Promise<DeepPartial<T> | null>;
            set<T>(key: string, value: DeepPartial<T>): Promise<void>;
            remove(key: string): Promise<void>;
            clear(): Promise<void>;
            keys(): Promise<string[]>;
        }
    }
}
