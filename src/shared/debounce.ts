export interface Callback<T, Args extends any[]> {
    (...args: Args): T
}

export default function debounce<T, Args extends any[]>(cb: Callback<T, Args>, ms: number): Callback<void, Args> {
    let handle: number | null;
    return function(...args: Args) {
        if (handle) window.clearTimeout(handle);
        handle = window.setTimeout(cb, ms, ...args);
    };
}
