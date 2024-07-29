import NumberSet, { type NumberSetLayout, type IndexableNumberSet } from "./set";

type PickByType<T extends object, Value> = {
    [P in keyof T as T[P] extends Value | undefined ? P : never]: T[P];
};

type KeyOfPickByType<T extends object, Value> = keyof PickByType<T, Value>;

type KeyOfPickLayoutNumberSet<T extends object> = KeyOfPickByType<T, NumberSetLayout>;
type KeyOfPickRecordSet<T extends object> = KeyOfPickByType<T, Record<number | string, boolean>>;
type KeyOfPickArray<T extends object> = KeyOfPickByType<T, any[]>;
type KeyOfPickRecord<T extends object> = KeyOfPickByType<T, Record<any, any>>;
type KeyOfPickBoolean<T extends object> = KeyOfPickByType<T, boolean>;

/** Write  */

export function writeArray<O extends object, K extends KeyOfPickArray<O>>(target: O, key: K, arr: O[K]) {
    if ((arr as any[]).length) {
        target[key] = arr as never;
    }
}

export function writeRecord<O extends object, K extends KeyOfPickRecord<O>>(target: O, key: K, obj: O[K]) {
    for (const _ in obj) {
        target[key] = obj as never;
        return;
    }
}

export function writeBoolean<O extends object, K extends KeyOfPickBoolean<O>>(
    target: O,
    key: K,
    value: boolean,
    dflt: boolean = false
) {
    if (dflt !== value) {
        target[key] = value as never;
    }
}

export function writeNumberSet<O extends object, K extends KeyOfPickLayoutNumberSet<O>>(
    target: O,
    key: K,
    set: NumberSet
) {
    if (set.size) {
        target[key] = set.values() as never;
    }
}

export function writeNumberSetToRecordSet<O extends object, K extends KeyOfPickRecordSet<O>>(
    target: O,
    key: K,
    set: NumberSet
) {
    if (set.size) {
        target[key] = Object.fromEntries(set.values().map((id) => [id, true])) as never;
    }
}

/** Read  */

export function readBoolean(value?: boolean, dftl?: boolean): boolean {
    return value ?? dftl ?? false;
}

export function readNumberSet(obj?: NumberSetLayout): IndexableNumberSet {
    return NumberSet.new(obj ?? []);
}

export function readRecordSetToNumberSet(obj?: Record<string | number, boolean>): IndexableNumberSet {
    return NumberSet.new(Object.keys(obj ?? {}).map(Number));
}
