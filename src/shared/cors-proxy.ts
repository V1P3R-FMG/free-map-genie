export default function (url: string | URL): string {
    url = typeof url === "string" ? new URL(url) : url;

    // If we are not on the same origin, we need to use a CORS proxy
    if (url.origin !== window.location.origin) {
        const corsURL = new URL(__CORS_PROXY__);
        corsURL.search = `?${url}`;
        return corsURL.toString();
    }

    return url.toString();
}
