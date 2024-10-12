import type { ChannelDriver, DriverOnMessageCallback } from "../types";

export default function createWindowChannelDriver(window: Window) {
    const handlers: Set<DriverOnMessageCallback> = new Set();

    const handler = (message: MessageEvent) => {
        handlers.forEach((h) => h(message.data));
    };

    window.addEventListener("message", handler);

    return {
        onMessage(cb) {
            handlers.add(cb);
        },
        postMessage(message) {
            window.postMessage(message);
        },
        disconnect() {
            handlers.clear();
            window.removeEventListener("message", handler);
        },
    } satisfies ChannelDriver;
}
