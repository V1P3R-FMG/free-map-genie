export interface CachedValueOptions {
    maxAge?: number;
    headers?: Record<string, string>;
}

export default class CachedValue<T> {
    private readonly maxAge: number;
    private readonly url: string;
    private readonly headers: Record<string, string>;

    private fetched?: number;
    private promise?: Promise<T>;
    private cache?: T;

    public constructor(url: string, options: CachedValueOptions = {}) {
        this.url = url;
        this.maxAge = options.maxAge ?? __CACHE_MAX_AGE__;
        this.headers = options.headers ?? {};
    }

    private checkCache(): boolean {
        if (!this.fetched) return false;
        if (Date.now() - this.fetched >= this.maxAge) return false;
        return true;
    }

    private async fetch(): Promise<T> {
        const res = await fetch(this.url, {
            headers: this.headers,
        });

        this.cache = await res.json();
        this.fetched = Date.now();

        this.promise = undefined;

        return this.cache as T;
    }

    public get data(): Promise<T> {
        if (this.checkCache()) {
            return Promise.resolve(this.cache as T);
        }

        if (!this.promise) {
            this.promise = this.fetch();
        }

        return this.promise;
    }
}
