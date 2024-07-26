const DEFAULT_TIMEOUT = 10000;
const DEFAULT_INTERVAL = 1000;

interface State {
    resolved: boolean;
}

export interface Resolver<T> {
    (value: T): any;
}

export interface Rejecter {
    (error: any): any;
}

export interface Waiter<T> {
    (resolve: Resolver<T>, reject: Rejecter): Promise<any> | any;
}

export interface ConditionWaiter {
    (): Promise<boolean> | boolean;
}

export interface PossibleAsyncCallback {
    (...args: any[]): any | Promise<any>;
}

export interface TimeoutOptions {
    timeout?: number;
    message?: string;
}

export interface WaiterTimeoutOptions extends TimeoutOptions {
    interval?: number;
}

export class TimeoutError extends Error {
    public constructor(msg?: string) {
        msg = msg?.replace(/\.$/, "");
        super(msg ? `Promise Timeout ${msg}.` : "Promise Timeout.");
    }
}

function callbackWrapper<F extends (arg: any) => any>(cb: F, handle: number | undefined, state: State): F {
    return ((arg: any) => {
        if (state.resolved) return;
        // logger.debug("Resolved", arg, handle);
        state.resolved = true;
        window.clearTimeout(handle);
        return cb(arg);
    }) as F;
}

function createTimeout<T>(
    resolve: Resolver<T>,
    reject: Rejecter,
    { timeout, message }: TimeoutOptions = {}
): [Resolver<T>, Rejecter, State, number | undefined] {
    const state: State = { resolved: false };

    let handle;
    if (timeout === undefined || timeout > 0) {
        handle = window.setTimeout(
            callbackWrapper(() => reject(new TimeoutError(message)), undefined, state),
            timeout ?? DEFAULT_TIMEOUT
        );
    }

    return [callbackWrapper(resolve, handle, state), callbackWrapper(reject, handle, state), state, handle];
}

export function waitFor<T = void>(waiter: Waiter<T>, { timeout, message, interval }: WaiterTimeoutOptions = {}) {
    return new Promise<T>(async (resolve, reject) => {
        const [resolver, rejecter, state] = createTimeout(resolve, reject, { timeout, message });

        const handle = window.setInterval(async () => {
            if (state.resolved) return window.clearInterval(handle);
            try {
                await waiter(resolver, rejecter);
            } catch (e) {
                rejecter(e);
            }
        }, interval ?? DEFAULT_INTERVAL);
    });
}

export function waitForCondition(waiter: ConditionWaiter, options?: WaiterTimeoutOptions) {
    return waitFor(async (resolve, reject) => {
        try {
            if (await waiter()) resolve();
        } catch (e) {
            reject(e);
        }
    }, options);
}

export function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function timeout<T>(p: Promise<T>, ms: number, message?: string): Promise<T> {
    if (ms <= 0) return p;

    return new Promise(async (resolve, reject) => {
        const [resolver, rejecter] = createTimeout(resolve, reject, { timeout: ms, message });

        try {
            resolver(await p);
        } catch (e) {
            rejecter(e);
        }
    });
}
