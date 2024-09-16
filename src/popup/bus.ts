export interface BusEventMap {
    "alert-info": [string];
    "alert-warn": [string];
    "alert-success": [string];
    "alert-error": [string];
}

export type EventName = keyof BusEventMap;

export interface BusEventCallback<E extends EventName> {
    (...args: BusEventMap[E]): void;
}

const callbacks: Record<EventName, BusEventCallback<any>[] | void> = {} as any;

export default {
    $on: <E extends EventName>(event: E, cb: BusEventCallback<E>) => {
        callbacks[event] ??= [];
        callbacks[event].push(cb);
    },
    $once: <E extends EventName>(event: E, cb: BusEventCallback<E>) => {
        const wrapper = (...args: BusEventMap[E]) => {
            cb(...args);
            callbacks[event] = callbacks[event]?.filter((callback) => callback !== wrapper);
        };
        callbacks[event] ??= [];
        callbacks[event].push(wrapper);
    },
    $off: <E extends EventName>(event: E, cb: BusEventCallback<E>) => {
        if (event in callbacks) {
            callbacks[event] = callbacks[event]?.filter((callback) => callback !== cb);
        }
    },
    $emit: <E extends EventName>(event: E, ...args: BusEventMap[E]) => {
        callbacks[event]?.forEach((cb) => cb(...args));
    },
};
