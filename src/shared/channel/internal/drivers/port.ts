import { encodeConnectionArgs } from "../connection-args";
import type { ChannelDriver, Fingerprint } from "../types";

export type Listener = (message: any) => any;

export default function createPortChannelDriver(name: string, fingerprint: Fingerprint) {
    let port: chrome.runtime.Port;

    const listeners: Set<Listener> = new Set();

    const handleMessage = (message: any) => listeners.forEach((cb) => cb(message));

    const connect = () => {
        port = chrome.runtime.connect({
            name: encodeConnectionArgs({
                context: name,
                fingerprint,
            }),
        });

        port.onMessage.addListener(handleMessage);
        port.onDisconnect.addListener(connect);
    };

    connect();

    return {
        onMessage(cb) {
            listeners.add(cb);
        },
        postMessage(message) {
            port.postMessage(message);
        },
        disconnect() {
            port.disconnect();
        },
    } satisfies ChannelDriver;
}
