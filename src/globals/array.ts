declare global {
    interface ArrayConstructor {
        /**
         * Creates a array with n elements
         * Warn: Does not copy the value!
         * @param n the desired length for the array.
         * @param value the value to fill the array with.
         */
        withLength<T>(n: number, value: T): T[];
    }

    interface Array<T> {
        /**
         * Sum all values in the array.
         */
        sum(): T;
    }
}

function* iterate(n: number, v: any): any {
    for (let i = 0; i < n; i++) yield v;
}

Array.withLength = function <T>(n: number, value: T): T[] {
    return [...iterate(n, value)];
};

Array.prototype.sum = function (this: Array<any>): any {
    return this.reduce((a, b) => a + b);
};

export {};
