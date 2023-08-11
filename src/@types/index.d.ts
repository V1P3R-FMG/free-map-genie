type Id = string | number;

type DictById<V> = Record<Id, V>;

declare module "*.vue";
declare module "*.json";
declare module "*.css";
declare module "*.png";
