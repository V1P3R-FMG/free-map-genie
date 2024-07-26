export function* iterateKeys<O extends object>(o: O): Generator<keyof O> {
    for (const key in o) yield key;
}

export function* iterateValues<O extends object>(o: O): Generator<O[keyof O]> {
    for (const key in o) yield o[key];
}

export function* iterateEntries<O extends object>(o: O): Generator<[keyof O, O[keyof O]]> {
    for (const key in o) yield [key, o[key]];
}

export function isEmpty(o: object) {
    for (const _ in o) return false;
    return true;
}
