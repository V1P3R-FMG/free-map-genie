import corsProxy from "@shared/cors-proxy";

export function headers() {
    const api = /* @mangle */ __GLOBAL_API_SECRET__; /* @/mangle */
    return {
        "X-Api-Secret": api
    };
}

const windowFetch = window.fetch;

export function fetch(url: string, init?: RequestInit) {
    const urlWithoutStartingSlash = url.replace(/^\//, "");
    const targetUrl = [`https://mapgenie.io/api/v1`, urlWithoutStartingSlash].join("/");
    return windowFetch(
        corsProxy(targetUrl), {
        ...init,
        headers: {
            ...headers(),
            ...init?.headers
        }
    });
}