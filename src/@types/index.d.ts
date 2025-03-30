type Id = string | number;

type DictById<V> = Record<Id, V>;

interface Callback<T, A extends any[]> {
    (...args: A): T;
}

// type DeepPartial<T> = import("type-fest").PartialDeep<T>;
type DeepPartial<T> = {
    [K in keyof T]?: T[K] extends DictById<any>
        ? T[K]
        : T[K] extends object
        ? DeepPartial<T[K]>
        : T[K];
};

type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};

declare type PickMatching<T, V> = {
    [K in keyof T as T[K] extends V ? K : never]: T[K];
};

declare module "*.vue";
