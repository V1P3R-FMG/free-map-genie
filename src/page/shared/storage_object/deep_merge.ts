import deepCopy from "./deep_copy";

export default function deepMerge<T extends object=object>(value: object, source: object): T {
    function helper(value: any, source: any) {
        if (typeof value === "object" && typeof source === "object") {
            const o = Object.assign(value instanceof Array ? [] : {}, value)
            for (let key in source) {
                o[key] = helper(value[key], source[key]);
            }
            return o;
        }
        return deepCopy<T>(typeof source === "undefined" ? value : source);
    }

    return helper(value, source) as T;
}