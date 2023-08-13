import { isEmpty } from "@shared/utils";

/**
 * It will non-recusively copy the given object.
 * @param o the object to make a shallow copy of.
 * @returns a shallowcopy of the given object.
 */
export function shallowCopy(o: any) {
    if (typeof o === "object") {
        if (Object.getPrototypeOf(o) === Array.prototype) {
            return [...o];
        }
        return { ...o };
    }
    return o;
}

/**
 * It will recursively copy the given object.
 * @param o the object to make a deepcopy of.
 * @returns a deepcopy of the given object.
 */
export function deepCopy<T>(o: T): T {
    if (typeof o !== "object" || o === null) return o;
    const newO: T = (
        Object.getPrototypeOf(o) === Array.prototype ? [] : {}
    ) as T;
    for (const key in o) {
        const val = o[key];
        if (typeof o === "object") {
            newO[key as keyof T] = deepCopy(val);
        } else {
            newO[key as keyof T] = val;
        }
    }
    return newO;
}

/**
 * It will recusively copy the given object and removes all empty values.
 * @param o the value to make a minimized copy of.
 * @returns a minimized deepcopy of the given object.
 */
export function minimizedCopy<T>(o: T): DeepPartial<T> | undefined {
    if (o === null) return undefined;
    if (typeof o !== "object") return o as any;
    const newO: any = Object.getPrototypeOf(o) === Array.prototype ? [] : {};
    for (const key in o) {
        const val = minimizedCopy(o[key]);
        if (!isEmpty(val)) {
            newO[key] = val as any;
        }
    }
    if (isEmpty(newO)) return undefined;
    return newO;
}
