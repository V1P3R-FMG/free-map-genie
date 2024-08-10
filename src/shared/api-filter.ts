import FmgWindow from "@shared/fmg-window";

export const ApiFiltered = Symbol("ApiFiltered");

export interface AxiosExtended extends Axios {
    [ApiFiltered]?: ApiFilter;
}

export const AxiosMethods = ["get", "post", "put", "delete"] as const;
export const AxiosMethodsAndAny = [...AxiosMethods, "any"] as const;

export type AxiosMethod = (typeof AxiosMethods)[number];
export type AxiosMethodAndAny = (typeof AxiosMethodsAndAny)[number];

export type MGApiType = "user";

export interface ApiFilterCallInfo<D = void> {
    method: string;
    url: string;
    path: string;
    type: MGApiType;
    id?: string;
    postData: D;
}

export interface ApiFilterCallbackResult {
    block?: boolean;
    newData?: any;
    result?: any;
}

export interface ApiFilterCallback<D = void> {
    (info: ApiFilterCallInfo<D>): Promise<ApiFilterCallbackResult | void> | ApiFilterCallbackResult | void;
}

export interface ApiFilterRegexResult {
    path: string;
    type: MGApiType;
    id?: string;
}

export interface Filter {
    regex: RegExp;
    type: MGApiType;
    callback: ApiFilterCallback<any>;
}

export interface ApiEndpointInfo {
    type?: MGApiType;
    version?: string;
    path: string;
    hasId?: boolean;
}

export default class ApiFilter {
    public readonly axios: AxiosExtended;
    public static readonly apiPath: string = "api";

    private readonly axiosMethods: Record<AxiosMethod, any>;

    protected filters: Record<AxiosMethodAndAny, Filter[]>;

    protected constructor(axios: AxiosExtended) {
        this.axios = axios;

        this.axiosMethods = Object.assign({}, ...AxiosMethods.map((method) => ({ [method]: axios[method] })));

        this.filters = Object.assign(
            {},
            ...AxiosMethodsAndAny.map((method) => {
                if (method !== "any") this.createFilterForAxiosMethod(method);
                return { [method]: [] };
            })
        );
    }

    public static async install(win: Window): Promise<ApiFilter> {
        const axios: AxiosExtended = await FmgWindow.from(win).waitForAxios();
        if (!axios[ApiFiltered]) {
            axios[ApiFiltered] = new this(axios);
        }
        return axios[ApiFiltered];
    }

    public static async uninstall(win: Window) {
        const axios: AxiosExtended = await FmgWindow.from(win).waitForAxios();
        const filter = axios[ApiFiltered];
        if (filter) {
            AxiosMethods.forEach((method) => (axios[method] = filter.axiosMethods[method]));
            delete axios[ApiFiltered];
        }
    }

    private static compileToRegex({ version, type, path, hasId }: ApiEndpointInfo): RegExp {
        return new RegExp(
            ApiFilter.apiPath +
                `/${version ?? "v1"}` +
                `/${type ?? "user"}` +
                `/(?<path>${path})` +
                (hasId ? "/(?<id>[\\d\\w_-]+)" : "") +
                "$"
        );
    }

    protected createFilterForAxiosMethod(method: AxiosMethod): void {
        const axiosMethod = this.axios[method];

        this.axios[method] = (async (...args: [string, object | undefined, ...any]) => {
            const [url, data] = args;

            if (!url.startsWith(`/${ApiFilter.apiPath}`)) {
                return axiosMethod.apply(this.axios, args as any);
            }

            const [block, result, newData] = await this.applyFilter(method, url, data);

            if (block) return result;

            const axiosResult = axiosMethod.apply(this.axios, [url, newData, ...args.slice(2)] as any);

            return result ?? axiosResult;
        }) as any;
    }

    protected findFilter(method: AxiosMethod, url: string): [Filter, ApiFilterRegexResult] | [] {
        const pathname = new URL(url, "https://mapgenie.io").pathname;

        const filter =
            this.filters[method].find((f) => f.regex.test(pathname)) ??
            this.filters["any"].find((f) => f.regex.test(pathname));

        if (!filter) return [];

        const result = filter.regex.exec(url);

        const { path, id } = result?.groups ?? {};
        const type = filter.type;

        return [filter, { path, id, type }];
    }

    protected async applyFilter(
        method: AxiosMethod,
        url: string,
        postData?: any
    ): Promise<[boolean, any | undefined, any | undefined]> {
        const [filter, info] = this.findFilter(method, url);

        if (filter && info) {
            const { block, result, newData } = (await filter.callback({ method, url, postData, ...info })) ?? {};

            return [block ?? false, result, newData ?? postData];
        }

        return [false, undefined, undefined];
    }

    public registerFilter<D = void>(
        methods: AxiosMethodAndAny | AxiosMethodAndAny[],
        info: ApiEndpointInfo,
        callback: ApiFilterCallback<D>
    ) {
        methods = Array.isArray(methods) ? methods : [methods];
        methods.forEach((method) => {
            this.filters[method].push({
                regex: ApiFilter.compileToRegex(info),
                type: info.type ?? "user",
                callback,
            });
        });
    }
}
