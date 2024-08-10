export const StorageFiltered = Symbol("StorageFiltered");

export interface WindowExtended extends Window {
    [StorageFiltered]?: StorageFilter;
}

export const StorageTypes = ["local", "session"] as const;

export type StorageType = (typeof StorageTypes)[number];

export const StorageActions = ["set", "get", "remove"] as const;

export type StorageAction = (typeof StorageActions)[number];

export type StorageActionAndAny = StorageAction | "any";

export interface StorageFilterCallback<G extends string[]> {
    (
        storage: Storage,
        action: StorageAction,
        key: string,
        value: string | undefined,
        groups: {
            [key in G[number]]?: string;
        },
        block: () => void
    ): string | undefined | void;
}
export interface Filter<G extends string[]> {
    regex: RegExp;
    callback: StorageFilterCallback<G>;
}

export interface StorageFilterGroup {
    [key: string | ""]: Filter<any>;
}

export default class StorageFilter {
    private filters: Record<StorageActionAndAny, StorageFilterGroup>;
    private storageMethods: Record<keyof Storage, any>;

    protected constructor() {
        this.storageMethods = Object.fromEntries(
            StorageActions.map((action) => `${action}Item`).map((method) => [method, Storage.prototype[method]])
        );

        this.filters = Object.fromEntries(([...StorageActions, "any"] as const).map((action) => [action, {}])) as any;

        this.createActionFilter("set", false);
        this.createActionFilter("get", true);
        this.createActionFilter("remove", false);
    }

    private createActionFilter(action: StorageAction, returns: boolean) {
        const filter = this.filter.bind(this);
        const method = `${action}Item`;
        const original = Storage.prototype[method];
        Storage.prototype[method] = function (...args: any[]) {
            const [key, value] = args;
            const [result, blocked] = filter(Storage.prototype, action, key, value);
            if (blocked) return returns ? result : undefined;
            return original.apply(this, [key, result ?? value]);
        };
    }

    public static install(win: WindowExtended) {
        return (win[StorageFiltered] ??= new StorageFilter());
    }

    public static uninstall(win: WindowExtended) {
        const filter = win[StorageFiltered];
        if (filter) {
            Object.entries(filter.storageMethods).forEach(([k, v]) => (Storage.prototype[k] = v));
        } else {
            throw "what";
        }
    }

    private getFilter<G extends string[] = []>(action: StorageAction, key: string): Filter<G> | undefined {
        // First check if there is a filter for the given action and key
        for (const filter in this.filters[action]) {
            if (this.filters[action][filter].regex.test(key)) {
                return this.filters[action][filter];
            }
        }
        // Then check if there is a filter for the any action and key
        for (const filter in this.filters.any) {
            if (this.filters.any[filter].regex.test(key)) {
                return this.filters.any[filter];
            }
        }
    }

    private filter(
        storage: Storage,
        action: StorageAction,
        key: string,
        value: string | undefined
    ): [string | undefined, boolean] {
        const filter = this.getFilter(action, key);

        let blocked = false;
        return [
            filter?.callback(storage, action, key, value, filter?.regex.exec(key)?.groups || {}, () => {
                blocked = true;
            }) ?? undefined,
            blocked,
        ];
    }

    public registerFilter<G extends string[] = []>(
        action: StorageActionAndAny,
        regex: string | RegExp | undefined,
        callback: StorageFilterCallback<G>
    ): void {
        // Convert the regex to a RegExp object
        regex = typeof regex === "string" ? new RegExp(regex) : (regex ?? new RegExp(""));

        // Check if the filter exists
        if (this.filters[action][regex.toString()]) {
            throw new Error(`Filter already exists for ${action} ${regex}`);
        }
        this.filters[action][regex.toString()] = {
            regex: new RegExp(regex ?? ""),
            callback,
        };
    }

    public unregisterFilter(action: StorageActionAndAny, regex?: string | RegExp | undefined): void {
        // Convert the regex to a RegExp object
        regex = typeof regex === "string" ? new RegExp(regex) : (regex ?? new RegExp(""));

        // Check if the filter exists
        if (!this.filters[action][regex.toString()]) {
            throw new Error(`Filter does not exist for ${action} ${regex}`);
        }
        delete this.filters[action][regex.toString()];
    }
}
