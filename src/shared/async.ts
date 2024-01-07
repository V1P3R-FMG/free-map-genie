import { hasKeys } from "./utils";

/**
 * Sleeps for the given amount of time.
 * @param ms the amount of time to sleep in milliseconds.
 * @returns a promise that resolves after the given amount of time.
 */
export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export class PromiseTimeoutError extends Error {
    constructor(error?: string) {
        if (error !== undefined) {
            super(`Promise timed out: ${error}`);
        } else {
            super("Promise timed out.");
        }
    }
}

/**
 * Timeout a promise after the given amount of time.
 * @throws {PromiseTimeoutError} if the promise times out.
 * @param promise the promise to timeout.
 * @param ms the amount of time to wait before timing out.
 * @returns a promise that resolves with the result of the given promise or rejects with the error of the given promise.
 */
export function timeout<T>(promise: Promise<T>, ms: number, error?: string): Promise<T> {
    return new Promise((resolve, reject) => {
        const timeout = ms > 0 && setTimeout(() => {
            reject(new PromiseTimeoutError(error));
        }, ms);
        promise
            .then((result) => {
                if (timeout) clearTimeout(timeout);
                resolve(result);
            })
            .catch((error) => {
                if (timeout) clearTimeout(timeout);
                reject(error);
            });
    });
}

/**
 * Wait for callback to return true
 * @param callback the callback to wait for.
 * @param timeoutTime reject promise if we are waiting longer then given timeout -1 for no rejection.
 * @returns a promise that resolves when the callback returns true.
 */
export async function waitForCallback(callback: () => boolean, timeoutTime: number = -1) {
    if (callback()) return;
    return timeout((async () => {
        while (!callback()) await sleep(100);
    })(), timeoutTime);
}

/**
 * Wait for globals to be defined
 * @param globals the globals or global to wait for.
 * @param window the window to check for the globals.
 * @param timeoutTime reject promise if we are waiting longer then given timeout -1 for no rejection.
 * @returns a promise that resolves when the globals are defined.
 */
export async function waitForGlobals(
    globals: keyof Window | (keyof Window)[],
    window: Window,
    timeoutTime: number = -1
) {
    if (typeof globals === "string") {
        globals = [globals];
    }
    return waitForCallback(() => hasKeys(window, globals as (keyof Window)[]), timeoutTime);
}

/**
 * Promisify a callback function.
 */
export function promisify<C extends (...args: any[]) => any>(
    callback: C,
    ...args: Parameters<C>
): Promise<ReturnType<C>> {
    return new Promise((resolve, reject) => {
        try {
            resolve(callback(...args));
        } catch (error) {
            reject(error);
        }
    });
}

export interface BlockCallback {
    (): void;
}

export interface BlockableCallback<T, A extends any[]> {
    (...args: [...A, BlockCallback]): T | Promise<T>;
}

export class Blocked<T = any> extends Error {
    public result: T;

    constructor(result: T) {
        super("Blocked");
        this.result = result;
    }
}

function catcher(err: any) {
    if (err instanceof Blocked) {
        return err.result;
    }
    throw err;
}

/**
 * Blocable function.
 */
export async function blockable<T, A extends any[]>(
    callback: BlockableCallback<T, A>,
    ...args: A
): Promise<T> {
    let blocked = false;

    const result = await promisify(callback, ...args, () => {
        blocked = true;
    });

    if (blocked) {
        throw new Blocked(result);
    }

    return result;
}

blockable.catcher = catcher;
