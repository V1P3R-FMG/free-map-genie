import { encodeConnectionArgs } from "../connection-args";
import type { ChannelDriver, Fingerprint } from "../types";

export default function createPortChannelDriver(name: string, fingerprint: Fingerprint) {
    let port: chrome.runtime.Port;

    const connect = () => {
        port = chrome.runtime.connect({
            name: encodeConnectionArgs({
                context: name,
                fingerprint,
            }),
        });

        port.onDisconnect.addListener(connect);
    };

    connect();

    return {
        onMessage(cb) {
            port.onMessage.addListener((message) => cb(message));
        },
        postMessage(message) {
            port.postMessage(message);
        },
        disconnect() {
            port.disconnect();
        },
    } satisfies ChannelDriver;
}
