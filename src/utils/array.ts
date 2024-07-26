interface ValueFactory<T> {
    (i: number): T;
}

function isValueFactory(value: any): value is ValueFactory<any> {
    return typeof value === "function";
}

export function createArray<T>(length: number, value: T | ValueFactory<T>): T[] {
    const array = new Array<T>(length);

    const getValue = isValueFactory(value) ? value : () => value;

    for (let i = 0; i < length; i++) {
        array[i] = getValue(i);
    }

    return array;
}

export function sumArray(arr: number[]): number {
    return arr.reduce((a, b) => a + b);
}
