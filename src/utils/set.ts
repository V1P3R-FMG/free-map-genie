export type NumberSetLayout = number[];

export interface Indexable {
    [value: number]: boolean;
    [value: string]: boolean;
}

export type IndexableNumberSet = NumberSet & Indexable;

export class IndexableSetProxyHandler implements ProxyHandler<NumberSet> {
    public get(target: NumberSet, p: string | symbol, recv: any) {
        if (typeof p === "symbol" || Reflect.has(target, p)) {
            return Reflect.get(target, p, recv);
        } else {
            return target.has.call(target, p);
        }
    }

    public set(target: NumberSet, p: string | symbol, value: any) {
        if (typeof p === "symbol" || Reflect.has(target, p)) {
            throw "Cannot override NumberSet methods.";
        } else {
            if (typeof value !== "boolean") {
                throw "Expected boolean value";
            }
            target.toggle.call(target, p, value);
            return true;
        }
    }

    public has(target: NumberSet, p: string | symbol) {
        if (typeof p === "symbol" || Reflect.has(target, p)) {
            return Reflect.has(target, p);
        } else {
            return target.has.call(target, p);
        }
    }

    public deleteProperty(target: NumberSet, p: string | symbol): boolean {
        if (typeof p === "symbol" || Reflect.has(target, p)) {
            return Reflect.deleteProperty(target, p);
        } else {
            return target.delete.call(target, p);
        }
    }

    public ownKeys(target: NumberSet): ArrayLike<string> {
        return target.values.call(target).map(String);
    }

    public getOwnPropertyDescriptor(target: NumberSet, p: string | symbol): PropertyDescriptor | undefined {
        if (typeof p === "symbol" || Reflect.has(target, p)) {
            return Reflect.getOwnPropertyDescriptor(target, p);
        } else {
            return {
                value: target.has.call(target, p),
                enumerable: true,
                configurable: true,
            };
        }
    }
}

export default class NumberSet {
    private readonly internal: Set<number> = new Set();

    private constructor(iterable: Iterable<number>) {
        this.internal = new Set(iterable);
    }

    public static isIndexableSet(obj: any): obj is IndexableNumberSet {
        return obj instanceof NumberSet;
    }

    public static new(array?: Array<number | string>): IndexableNumberSet {
        return new Proxy(new NumberSet(array?.map(Number) ?? []), new IndexableSetProxyHandler()) as IndexableNumberSet;
    }

    public toggle(value: number | string, toggled?: boolean): boolean {
        value = Number(value);
        toggled ??= !this.internal.has(value);
        if (toggled) {
            this.internal.add(value);
            return true;
        } else {
            this.internal.delete(value);
            return false;
        }
    }

    public has(value: number | string): boolean {
        return this.internal.has(Number(value));
    }

    public add(value: number | string) {
        this.internal.add(Number(value));
    }

    public delete(value: number | string): boolean {
        return this.internal.delete(Number(value));
    }

    public values(): NumberSetLayout {
        return [...this.internal.values()];
    }

    public get size(): number {
        return this.internal.size;
    }
}
