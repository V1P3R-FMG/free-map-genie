import { blockable, type BlockableCallback } from "@shared/async";

export type ApiFilteredCallback<T = any, R = any> = BlockableCallback<
    undefined | void | R,
    [string, string, string, T, string]
>;

export const AxiosMethods = ["get", "put", "post", "delete"] as const;

export type AxiosMethod = (typeof AxiosMethods)[number];

export type AxiosMethodAndAny = AxiosMethod | "any";

export interface ApiMethodFilter {
    regex: RegExp;
    callback: ApiFilteredCallback;
}

export interface ApiMethodFilterGroup {
    [key: string]: ApiMethodFilter;
}

export const ApiFiltered = Symbol("ApiFiltered");

export interface AxiosExtended extends Lib.Axios {
    [ApiFiltered]?: FMG_ApiFilter;
}

/**
 * Filter api requests
 */
export class FMG_ApiFilter {
    private axios: AxiosExtended;
    private filters: Record<AxiosMethodAndAny, ApiMethodFilterGroup>;

    protected constructor(axios: AxiosExtended) {
        this.axios = axios;
        this.filters = {} as Record<AxiosMethodAndAny, ApiMethodFilterGroup>;

        AxiosMethods.forEach((method) => {
            this.filters[method] = {};
            this.createProxyMethod(method);
        });
        this.filters.any = {};
    }

    /**
     * Install the api filter on the given window object
     * @param window the window object containing the axios object
     * @returns the installed api filter
     */
    public static install(window: Window): FMG_ApiFilter {
        if (!window.axios) throw new Error("axios not defined");
        // If the axios object has already been filtered, use that one instead
        if (!window.axios[ApiFiltered]) {
            window.axios[ApiFiltered] = new FMG_ApiFilter(window.axios);
        }
        return window.axios[ApiFiltered];
    }

    /**
     * Get the filter group for the given method and url
     * @param method the axios method
     * @param url the url to check
     * @returns the filter group, or undefined if no filter group was found
     */
    private getFilter(
        method: AxiosMethod,
        url: string
    ): ApiMethodFilter | undefined {
        // First check if there is a filter for the given method and key
        for (const group in this.filters[method]) {
            if (this.filters[method][group].regex.test(url)) {
                return this.filters[method][group];
            }
        }
        // Then check if there is a filter for the any method and key
        for (const group in this.filters.any) {
            if (this.filters.any[group].regex.test(url)) {
                return this.filters.any[group];
            }
        }
    }

    /**
     * Create a proxy method for the given axios method
     * @param method the axios method
     * @returns the proxy method
     */
    private createProxyMethod(method: AxiosMethod): void {
        const axiosMethod = this.axios[method];
        this.axios[method] = ((...args: any[]) => {
            const [url, data] = args;
            const group = this.getFilter(method, url);
            const { key, id } = group?.regex.exec(url)?.groups ?? {};

            return blockable<any, [string, string, string, any, string]>(
                group?.callback || (() => {}),
                method,
                key,
                id,
                data,
                url
            )
                .then((newData) =>
                    axiosMethod.apply(this.axios, [
                        url,
                        newData ?? data,
                        ...args.slice(2)
                    ] as any)
                )
                .catch(blockable.catcher);
        }) as any;
    }

    /**
     * Compile the given key to a regex
     * @param key the key to compile
     * @returns the compiled regex
     */
    private static compileKeyToRegex(key: string): RegExp {
        return new RegExp(
            "/api/v1/user/" + `(?<key>${key})` + "(?:/(?<id>\\d+))?" + "$"
        );
    }

    /**
     * reg
     * @param method
     * @param key
     * @param callback
     *
     * @throws Error if the filter already exists
     * @template T the type of the data
     *
     * @example
     * filter.registerFilter<undefined>(
     *   "put",
     *   "locations",
     *   (method, key, id, data, url, block) => {
     *     console.log("filter", method, key, id, data, url);
     *     block();
     *     return { test: "test" };
     *   }
     * ); // Will log the data and return { test: "test" } as a response,
     *    // and block the orignal request
     *
     * @example
     * filter.registerFilter<undefined>(
     *   "delete",
     *   "locations",
     *   (method, key, id, data, url, block) => {
     *     console.log("filter", method, key, id, data, url);
     *   }
     * ); // Will log the data, and not block the original request
     */
    public registerFilter<T = any, R = any>(
        method: AxiosMethodAndAny,
        key: string,
        callback: ApiFilteredCallback<T, R>
    ) {
        // Check if the filter already exists
        if (this.filters[method][key]) {
            // If the filter already exists, throw an error
            throw new Error(`Filter already exists for ${method} ${key}`);
        } else {
            // If the filter doesn't exist, create it
            this.filters[method][key] = {
                regex: FMG_ApiFilter.compileKeyToRegex(key),
                callback: callback
            };
        }
    }

    /**
     * Unregister the filter for the given method and key
     * @param method the axios method
     * @param key the key to unregister
     */
    public unregisterFilter(method: AxiosMethod, key: string) {
        // Check if the filter exists
        if (this.filters[method][key]) {
            // If the filter exists, delete it
            delete this.filters[method][key];
        } else {
            // If the filter doesn't exist, throw an error
            throw new Error(`Filter does not exist for ${method} ${key}`);
        }
    }
}
