import { BlockCallback } from "@shared/async";

export const StorageFiltered = Symbol("StorageFiltered");

export interface WindowExtended extends Window {
    [StorageFiltered]?: FMG_StorageFilter;
    Storage?: Storage;
}

type MatchGroups = RegExpMatchArray["groups"];

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
            [key in G[number]]?: string | undefined;
        },
        block: BlockCallback
    ): string | undefined | void;
}
export interface StorageFilter<G extends string[]> {
    regex: RegExp;
    callback: StorageFilterCallback<G>;
}

export interface StorageFilterGroup {
    [key: string | ""]: StorageFilter<any>;
}

export class FMG_StorageFilter {
    private filters: Record<StorageActionAndAny, StorageFilterGroup>;

    protected constructor(window: WindowExtended) {
        if (!window.Storage) throw new Error("Storage not found");

        const prototype = window.Storage.prototype as Storage;
        this.createActionFilter("set", prototype, false);
        this.createActionFilter("get", prototype, true);
        this.createActionFilter("remove", prototype, false);

        this.filters = {} as Record<StorageActionAndAny, StorageFilterGroup>;

        for (const action of StorageActions) {
            this.filters[action] = {};
        }
        this.filters.any = {};

        logger.log("Storage Filter Installed");
    }

    /**
     * Creates a filter for the given action.
     * @param action the action to filter
     * @param storage the storage to filter
     */
    private createActionFilter(
        action: StorageAction,
        storage: Storage,
        returns: boolean
    ) {
        const filter = this.filter.bind(this);
        const original = storage[action + "Item"];
        storage[action + "Item"] = function (...args: any[]) {
            const [key, value] = args;
            const [result, blocked] = filter(storage, action, key, value);
            if (blocked) return returns ? result : undefined;
            return original.apply(this, [key, result ?? value]);
        };
        storage["_" + action + "Item"] = original;
    }

    /**
     * Install the storage filter.
     * @param window the window to install the storage filter on
     * @returns the installed storage filter
     */
    public static install(window: WindowExtended) {
        if (!window[StorageFiltered]) {
            window[StorageFiltered] = new FMG_StorageFilter(window);
        }
        return window[StorageFiltered];
    }

    /**
     * Uninstall the storage filter.
     * @param window the window to uninstall the storage filter from
     * @returns the uninstalled storage filter
     */
    public static uninstall(window: WindowExtended) {
        if (!window.Storage) throw new Error("Storage not found");
        const filter = window[StorageFiltered];
        if (filter) {
            if (window.Storage.prototype) {
                window.Storage.prototype.setItem =
                    window.Storage.prototype._setItem;
                window.Storage.prototype.getItem =
                    window.Storage.prototype._getItem;
                window.Storage.prototype.removeItem =
                    window.Storage.prototype._removeItem;
                delete window.Storage.prototype._setItem;
                delete window.Storage.prototype._getItem;
                delete window.Storage.prototype._removeItem;
            }
            delete window[StorageFiltered];
            logger.log("Storage Filter Uninstalled");
        }
    }

    /**
     * Get the filter group for the given action and key.
     * @param action the action to check
     * @param key the key to check
     * @returns the filter group, or undefined if no filter group was found
     */
    private getFilter<G extends string[] = []>(
        action: StorageAction,
        key: string
    ): StorageFilter<G> | undefined {
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

    /**
     * Filter the given storage action.
     * @param storage the storage to filter
     * @param action the action to filter
     * @param key the key to filter
     * @param value the value to filter
     * @returns a boolean indicating if the action should be blocked
     */
    private filter(
        storage: Storage,
        action: StorageAction,
        key: string,
        value: string | undefined
    ): [string | undefined, boolean] {
        const filter = this.getFilter(action, key);

        let blocked = false;
        return [
            filter?.callback(
                storage,
                action,
                key,
                value,
                filter?.regex.exec(key)?.groups || {},
                () => {
                    blocked = true;
                }
            ) ?? undefined,
            blocked
        ];
    }

    /**
     * Register a filter for the given action and key.
     * @param action
     * @param regex
     * @param callback
     */
    public registerFilter<G extends string[] = []>(
        action: StorageActionAndAny,
        regex: string | RegExp | undefined,
        callback: StorageFilterCallback<G>
    ): void {
        // Convert the regex to a RegExp object
        regex =
            typeof regex === "string"
                ? new RegExp(regex)
                : regex ?? new RegExp("");

        // Check if the filter exists
        if (this.filters[action][regex.toString()]) {
            throw new Error(`Filter already exists for ${action} ${regex}`);
        }
        this.filters[action][regex.toString()] = {
            regex: new RegExp(regex ?? ""),
            callback
        };
    }

    /**
     * Unregister a filter for the given action and key.
     */
    public unregisterFilter(
        action: StorageActionAndAny,
        regex?: string | RegExp | undefined
    ): void {
        // Convert the regex to a RegExp object
        regex =
            typeof regex === "string"
                ? new RegExp(regex)
                : regex ?? new RegExp("");

        // Check if the filter exists
        if (!this.filters[action][regex.toString()]) {
            throw new Error(`Filter does not exist for ${action} ${regex}`);
        }
        delete this.filters[action][regex.toString()];
    }
}
