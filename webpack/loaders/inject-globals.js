const API_SECRET = process.env.API_SECRET ?? "";

/**
 * @typedef {import("webpack").LoaderContext<any>} LoaderContext
 *
 * @this {LoaderContext}
 * @param {string} source
 * @returns {string}
 */
export default function injectGlobals(source) {
    return source.replace("__GLOBAL_API_SECRET__", JSON.stringify(API_SECRET));
}
