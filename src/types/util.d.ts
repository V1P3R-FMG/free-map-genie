declare type Option<T> = T | null;
declare type Nullable<T> = T | null;

declare type Possible<T> = T | undefined;

declare type Prepend<T, U extends any[]> = [T, ...U];

declare type PickMatching<T, V> = {
    [K in keyof T as T[K] extends V ? K : never]: T[K];
};

declare type PromiseLike<T> = Promise<T> | T;

declare type PossibleArray<T> = T | T[];
