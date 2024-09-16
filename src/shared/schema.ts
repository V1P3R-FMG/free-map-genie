type _<T> = unknown & { [P in keyof T]: T[P] };

export type Schema<T> = {
    parse(value: unknown): T;
};

export type Type<S extends Schema<unknown>> = ReturnType<S["parse"]>;

type ObjectParseResult<Rec extends Record<string, Schema<unknown>>> = _<{
    [K in keyof Rec as undefined extends Rec[K] ? never : K]: Type<Rec[K]>;
}>;

type ArrayParseResult<Arr extends Schema<unknown>[]> = _<{
    [I in keyof Arr]: Type<Arr[I]>;
}>;

type UnionParseResult<Arr extends Schema<unknown>[]> = ArrayParseResult<Arr>[number];

export type SchemaObject<Def extends Record<string, Schema<unknown>>> = Schema<ObjectParseResult<Def>> & {
    field<K extends keyof Def>(name: K): Def[K];
};

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I extends U) => void
    ? I
    : never;

type IntersectionParseResult<Arr extends Schema<unknown>[]> = _<UnionToIntersection<UnionParseResult<Arr>>>;

export class SchemaError extends Error {
    public readonly errors: string[];
    public readonly message: string;

    constructor(errors: string | string[]) {
        errors = typeof errors === "string" ? [errors] : errors;

        const message = errors.join(", ");
        super(message);

        this.errors = errors;
        this.message = message;
    }

    public static error(e: unknown): string {
        if (e instanceof SchemaError) {
            return e.message;
        }
        return `${e}`;
    }
}

function serialize(value: unknown): string {
    return JSON.stringify(value).replace(/"/g, "'");
}

export function string(): Schema<string> {
    return {
        parse(value: unknown): string {
            if (typeof value === "string") {
                return value;
            }
            throw new SchemaError(`value ${serialize(value)} is not a string`);
        },
    };
}

export function number(): Schema<number> {
    return {
        parse(value: unknown): number {
            if (typeof value === "number") {
                return value;
            }
            throw new SchemaError(`value ${serialize(value)} is not a number`);
        },
    };
}

export function boolean(): Schema<boolean> {
    return {
        parse(value: unknown): boolean {
            if (typeof value === "boolean") {
                return value;
            }
            throw new SchemaError(`value ${serialize(value)} is not a boolean`);
        },
    };
}

export type Literal = string | number | boolean | null | undefined;

export function literal<T extends Literal>(lit: T): Schema<T> {
    return {
        parse(value: unknown): T {
            if (value === lit) {
                return value as never;
            }
            throw new SchemaError(`value ${serialize(value)} is equal to ${serialize(lit)}`);
        },
    };
}

export function object<Def extends Record<string, Schema<T>>, T>(def: Def): SchemaObject<Def> {
    return {
        parse(value: unknown): ObjectParseResult<Def> {
            const errors: string[] = [];

            if (typeof value !== "object" || value === null || Array.isArray(value)) {
                throw new SchemaError(`value ${serialize(value)} is not an object`);
            }

            for (const k in def) {
                try {
                    def[k].parse((value as never)[k]);
                } catch (e) {
                    errors.push(`key \`${k}\` is invalid: ${SchemaError.error(e)}`);
                }
            }

            if (errors.length > 0) {
                throw new SchemaError(errors);
            }

            return value as never;
        },
        field<K extends keyof Def>(name: K) {
            return def[name];
        },
    };
}

export function record<K extends string | number, V>(key: Schema<K>, value: Schema<V>): Schema<Record<K, V>> {
    return {
        parse(record: unknown): Record<K, V> {
            const errors: string[] = [];

            if (typeof record !== "object" || record === null || Array.isArray(record)) {
                throw new SchemaError(`value ${serialize(value)} is not an object`);
            }

            for (const [k, v] of Object.entries(record)) {
                try {
                    key.parse(k);
                    value.parse(v);
                } catch (e) {
                    errors.push(SchemaError.error(e));
                }
            }

            if (errors.length > 0) {
                throw new SchemaError(errors);
            }

            return record as never;
        },
    };
}

export function array<T>(schema: Schema<T>): Schema<T[]> {
    return {
        parse(value: unknown): T[] {
            const errors: string[] = [];

            if (!Array.isArray(value)) {
                throw new SchemaError(`value ${serialize(value)} is not an array`);
            }

            const length = value.length;
            for (let i = 0; i < length; i++) {
                try {
                    schema.parse(value[i]);
                } catch (e) {
                    errors.push(`index ${i} is invalid: ${SchemaError.error(e)}`);
                }
            }

            if (errors.length > 0) {
                throw new SchemaError(errors);
            }

            return value;
        },
    };
}

export function union<Arr extends Schema<T>[], T>(parsers: Arr): Schema<UnionParseResult<Arr>> {
    return {
        parse(value: unknown): UnionParseResult<Arr> {
            const errors: string[] = [];

            for (const parser of parsers) {
                try {
                    return parser.parse(value) as never;
                } catch (e) {
                    errors.push(SchemaError.error(e));
                }
            }

            if (errors.length > 0) {
                throw new SchemaError(errors);
            }

            return value as never;
        },
    };
}

export function intersection<Arr extends Schema<T>[], T>(parsers: Arr): Schema<IntersectionParseResult<Arr>> {
    return {
        parse(value: unknown): IntersectionParseResult<Arr> {
            const errors: string[] = [];

            for (const parser of parsers) {
                try {
                    parser.parse(value) as never;
                } catch (e) {
                    errors.push(SchemaError.error(e));
                }
            }

            if (errors.length > 0) {
                throw new SchemaError(errors);
            }

            return value as never;
        },
    };
}

export function instanceOf<T extends { new (): unknown }>(cls: T): Schema<InstanceType<T>> {
    return {
        parse(value: unknown): InstanceType<T> {
            if (value instanceof cls) {
                return value as never;
            }
            throw new SchemaError(`value ${serialize(value)} is not an instanceof ${cls}`);
        },
    };
}

export function any(): Schema<any> {
    return {
        parse(value: unknown): any {
            return value;
        },
    };
}

export function optional<T>(value: Schema<T>): Schema<T | undefined> {
    return {
        parse(input: unknown): any {
            if (input === undefined) {
                return value as never;
            }

            value.parse(input);

            return value as never;
        },
    };
}

export function nullable<T>(value: Schema<T>): Schema<T | null> {
    return {
        parse(input: unknown): any {
            if (input === null) {
                return value as never;
            }

            value.parse(input);

            return value as never;
        },
    };
}
