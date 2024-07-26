const DEFAULT_TIMEOUT = 10000;
const DEFAULT_INTERVAL = 1000;

interface State {
    resolved: boolean;
}

export interface Resolver<T> {
    (value: T): any;
}

export interface Rejecter {
    (e: any): any;
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
        super(msg ? `Timeout ${msg}.` : "Timeout.");
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
            callbackWrapper(
                () => reject(new TimeoutError(message ?? "Promise.waitFor took to long")),
                undefined,
                state
            ),
            timeout ?? DEFAULT_TIMEOUT
        );
    }

    return [callbackWrapper(resolve, handle, state), callbackWrapper(reject, handle, state), state, handle];
}

declare global {
    interface PromiseConstructor {
        /**
         * Calls the waiter every couple of miliseconds until the resolver gets called.
         * @param waiter
         * @param interval
         * @param timeout
         */
        waitFor<T = void>(waiter: Waiter<T>, { timeout, message, interval }?: WaiterTimeoutOptions): Promise<T>;

        /**
         * Calls the waiter every couple of miliseconds until it returns true.
         * @param waiter
         * @param interval
         * @param timeout
         */
        waitForCondition(waiter: ConditionWaiter, { timeout, message, interval }?: WaiterTimeoutOptions): Promise<void>;

        /**
         * Creates a promise that resolves after the given amount of miliseconds.
         * @param ms
         */
        sleep(ms: number): Promise<void>;

        /**
         * Calls the given method async.
         * @param callback the callback to execute async
         */
        run(callback: PossibleAsyncCallback): Promise<void>;

        TimeoutError: typeof TimeoutError;
    }

    interface Promise<T> {
        /**
         * Wraps the promise in a timeout.
         * @param ms the amount of miliseconds after the promise should reject.
         */
        timeout(ms: number, msg?: string): Promise<T>;
    }
}

Promise.waitFor = async function <T>(waiter: Waiter<T>, { timeout, message, interval }: WaiterTimeoutOptions = {}) {
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
};

Promise.waitForCondition = async function (waiter: ConditionWaiter, options?: WaiterTimeoutOptions) {
    return Promise.waitFor(async (resolve, reject) => {
        try {
            if (await waiter()) resolve();
        } catch (e) {
            reject(e);
        }
    }, options);
};

Promise.sleep = function (ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

Promise.run = async function (callback: PossibleAsyncCallback) {
    await callback();
};

Promise.prototype.timeout = function (this: Promise<any>, ms: number, message?: string) {
    if (ms <= 0) return this;

    return new Promise(async (resolve, reject) => {
        const [resolver, rejecter] = createTimeout(resolve, reject, { timeout: ms, message });

        try {
            resolver(await this);
        } catch (e) {
            rejecter(e);
        }
    });
};

Promise.TimeoutError = TimeoutError;

export {};
