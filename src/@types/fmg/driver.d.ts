declare namespace FMG {
    namespace Storage {
        interface Driver {
            init(...any: any[]): Promise<void>;
            get<T>(key: string): Promise<T | null>;
            set<T>(key: string, value: T): Promise<void>;
            remove(key: string): Promise<void>;
        }
    }
}
