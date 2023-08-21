export class UndefinedError extends Error {
    constructor(name: string) {
        super(`${name} is not defined!`);
    }
}

/**
 * Check if the value is neither null or undefiend.
 * @throws {UndefinedError} if value is undefiend.
 * @param object the value to check.
 * @param name the name of the value for the error message.
 * @returns boolean indication if the value is defiend or not.
 */
export function isDefined<T = any>(
    object: T,
    name?: string
): object is NonNullable<T> {
    if (object == undefined || object == null) {
        if (name != undefined) {
            throw new UndefinedError(name);
        }
        return false;
    }
    return true;
}

/**
 * Check if the value is neither null or undefiend.
 * @throws {UndefinedError} if value is undefiend.
 * @param object the value to check.
 * @param name the name of the value for the error message.
 * @returns the given object.
 */
export function checkDefined<T = any>(object: T, name: string): NonNullable<T> {
    if (isDefined(object, name)) {
        return object;
    }
    throw new Error("Unexpected Error");
}

/**
 * Checks if a value is empty, null or undefiend.
 * @param o the value to check.
 * @returns boolean that indicates if the value is empty or not.
 */
export function isEmpty<T>(o: T | null | undefined): o is null | undefined {
    if (typeof o === "object" || typeof o === "string") {
        for (const _ in o as Iterable<T[keyof T]>) {
            return false;
        }
        return true;
    } else if (o === undefined || o === null) {
        return true;
    }
    return !o;
}

/**
 * Checks if a value neither empty, null or undefiend.
 * @param o the value to check.
 * @returns boolean that indicates if the value is not empty or not.
 */
export function isNotEmpty<T>(o: T | null | undefined): o is T {
    return !isEmpty(o);
}

/**
 * Checks if the given keys are in the given object.
 * @param object the object to check.
 * @param keys the keys to check.
 * @returns boolean that indicates if the keys are in the object or not.
 */
export function hasKeys<T extends object, K extends keyof T>(
    object: T,
    keys: K[]
): object is T & Record<K, T[K]> {
    return keys.every((key) => key in object);
}
