import type { ChannelDriver, DriverOnMessageCallback, DriverState } from "../types";

export default function createWindowChannelDriver(window: Window) {
    let state: DriverState = "disconnected";
    const handlers: Set<DriverOnMessageCallback> = new Set();

    const handler = (message: MessageEvent) => {
        handlers.forEach((h) => h(message.data));
    };

    const connect = () => {
        state = "connected";

        window.addEventListener("message", handler);
    };

    const disconnect = () => {
        state = "disconnected";

        handlers.clear();
        window.removeEventListener("message", handler);
    };

    return {
        onMessage(cb) {
            handlers.add(cb);
        },
        postMessage(message) {
            if (state === "disconnected") throw "Not connected yet.";

            window.postMessage(message);
        },
        connect,
        disconnect,
        get state() {
            return state;
        },
    } satisfies ChannelDriver;
}
