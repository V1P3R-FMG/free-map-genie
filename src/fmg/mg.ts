import { sendMessage } from "webext-bridge/window";

/** Proxy mapgenie api request trough the background worker */
export function apiFetch<T extends object = any>(path: string) {
    return sendMessage<T, string>("fmg:api:fetch", { path });
}