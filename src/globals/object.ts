declare global {
    interface ObjectConstructor {
        /** Creates an key iterator over entries */
        iterateKeys<O extends object>(o: O): Generator<keyof O>;

        /** Creates an value iterator over values */
        iterateValues<O extends object>(o: O): Generator<O[keyof O]>;

        /** Creates an entry iterator over entries */
        iterateEntries<O extends object>(
            o: O
        ): Generator<[keyof O, O[keyof O]]>;

        /** Checks if an object is empty */
        isEmpty(o: object): boolean;
    }
}

Object.iterateKeys = function* <O extends object>(o: O): Generator<keyof O> {
    for (const key in o) yield key;
};

Object.iterateValues = function* <O extends object>(
    o: O
): Generator<O[keyof O]> {
    for (const key in o) yield o[key];
};

Object.iterateEntries = function* <O extends object>(
    o: O
): Generator<[keyof O, O[keyof O]]> {
    for (const key in o) yield [key, o[key]];
};

Object.isEmpty = function (o: object) {
    for (const _ in o) return false;
    return true;
};

export {};
