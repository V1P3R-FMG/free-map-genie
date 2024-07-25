type ValueType =
    | "string"
    | "number"
    | "boolean"
    | "object"
    | "any"
    | "undefined"
    | "null";

type OptionalValueType = `${Exclude<ValueType, "any" | "undefined">}?`;
type UnionValueType = (ValueType | OptionalValueType)[];
type SchemeValueType = ValueType | OptionalValueType | UnionValueType;

type _<T> = T extends unknown ? { [K in keyof T]: _<T[K]> } : never;

type SchemeObjectType = { [key: string]: SchemeValueType };
type Scheme = SchemeValueType | SchemeObjectType;

type GetRawTypeFromValueType<T extends ValueType> = T extends "null"
    ? null
    : T extends "number"
      ? number
      : T extends "boolean"
        ? boolean
        : T extends "object"
          ? object
          : T extends "any"
            ? any
            : T extends "undefined"
              ? undefined
              : T extends "string"
                ? string
                : never;

type GetValueTypeFromOptionalValueType<T extends OptionalValueType> =
    T extends `${infer V}?` ? V : never;

type GetRawTypeFromOptionalValueType<T extends OptionalValueType> =
    | GetRawTypeFromValueType<GetValueTypeFromOptionalValueType<T>>
    | undefined;

type GetValueTypeFromUnionValueType<T extends UnionValueType> =
    T extends (infer V)[]
        ? V extends OptionalValueType
            ? GetValueTypeFromOptionalValueType<V> | "undefined"
            : V
        : never;

type GetRawTypeFromUnionValueType<T extends UnionValueType> =
    GetRawTypeFromValueType<GetValueTypeFromUnionValueType<T>>;

type GetRawType<T extends SchemeValueType> = T extends ValueType
    ? GetRawTypeFromValueType<T>
    : T extends OptionalValueType
      ? _<GetRawTypeFromOptionalValueType<T>>
      : T extends UnionValueType
        ? _<GetRawTypeFromUnionValueType<T>>
        : never;

type ValidatedObjectResult<T extends SchemeObjectType> = {
    [K in keyof T]: GetRawType<T[K]>;
};

type ValidatedResult<T extends Scheme> = T extends SchemeValueType
    ? GetRawType<T>
    : T extends SchemeObjectType
      ? ValidatedObjectResult<T>
      : never;

function isOptional(
    type: ValueType | OptionalValueType
): type is OptionalValueType {
    return type.endsWith("?");
}

function getRawTypeFromOptional(type: OptionalValueType): ValueType {
    return type.slice(0, -1) as ValueType;
}

function extractInfo(scheme: SchemeValueType): ValueType[] {
    const expectedTypes = Array.isArray(scheme) ? scheme : [scheme];

    const types = new Set<ValueType>();

    for (const type of expectedTypes) {
        if (type === "any") return ["any"];

        if (isOptional(type)) {
            types.add("undefined");
            types.add(getRawTypeFromOptional(type));
        } else {
            types.add(type);
        }
    }

    return [...types];
}

function isValid<E extends SchemeValueType>(
    scheme: E,
    value: any
): value is GetRawType<E> {
    const type = typeof value;
    for (const expected of extractInfo(scheme)) {
        switch (expected) {
            case "any":
                return true;
            case "null":
                if (type === null) return true;
            default:
                if (type === expected) return true;
                break;
        }
    }
    return false;
}

function schemeToString<E extends SchemeValueType>(scheme: E): string {
    if (Array.isArray(scheme)) {
        return extractInfo(scheme).map(schemeToString).join(" | ");
    } else if (isOptional(scheme)) {
        return scheme + " | undefined";
    }
    return scheme;
}

function validateValue<E extends SchemeValueType>(
    scheme: E,
    value: any,
    name: string
) {
    if (!isValid(scheme, value)) {
        throw `Value ${name} does not match the requested scheme, expected type ${schemeToString(scheme)}, but got type ${typeof value}.`;
    }
}

export function validate<S extends Scheme>(
    scheme: S,
    data: any,
    name?: string
): ValidatedResult<S> {
    name ??= "?";

    if (typeof scheme === "string") {
        validateValue(scheme, data, name);
        return data;
    }

    validateValue("object", data, name);
    for (const [prop, expected] of Object.entries(scheme)) {
        validateValue(
            expected as SchemeValueType,
            data[prop],
            name ? `${name}.${prop}` : prop
        );
    }

    return data;
}

export function scheme<S extends Scheme>(scheme: S): S {
    return scheme;
}

export default {
    check: validate,
    scheme,
};
