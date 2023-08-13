type Id = string | number;

type DictById<V> = Record<Id, V>;

interface Callback<T, A extends any[]> {
    (...args: A): T;
}

declare module "*.vue";
declare module "*.json";
declare module "*.css";
declare module "*.png";
