const API = process.env.API_SECRET ?? "";

/**
 * @typedef {import("webpack").LoaderContext<any>} LoaderContext
 *
 * @this {LoaderContext}
 * @param {string} source
 * @returns {string}
 */
export default function injectGlobals(source) {
    return source.replace("__GLOBAL__API__", JSON.stringify(API));
}
