import Channel, { ResponseType } from "@shared/channel";
import { Channels } from "@constants";
import { waitForBody } from "@utils/dom";
import * as s from "@shared/schema";

const messageScheme = s.object({
    type: s.union([s.literal("has"), s.literal("get"), s.literal("set"), s.literal("remove"), s.literal("keys")]),
    data: s.any(),
});

function createFrame(): HTMLIFrameElement {
    logging.debug("Create Frame", document.body);
    return $<HTMLIFrameElement>("<iframe/>")
        .attr({
            "id": "mapgenie-storage",
            "src": `https://mapgenie.io/?origin=${window.location.origin}`,
            "width": 0,
            "height": 0,
            "marginwidth": 0,
            "marginheight": 0,
            "hspace": 0,
            "vspace": 0,
            "frameborder": 0,
            "scrolling": "no",
            "aria-hidden": true,
        })
        .appendTo(document.body)
        .get(0)!;
}

function getFrame(): HTMLIFrameElement {
    const iframe = $<HTMLIFrameElement>("#mapgenie-storage");
    return iframe.length > 0 ? iframe.get(0)! : createFrame();
}

async function forwardMessage<T>(type: string, key?: string, value?: string, timeout?: number): Promise<T> {
    const data = { key, value };
    const payload = { type, data };
    return Channel.extension(Channels.Extension).send(Channels.Mapgenie, payload, timeout);
}

export default async function initStorage() {
    await waitForBody(document);

    const _iframe = getFrame(); // Create iframe if it doesn't exist.

    // Channel to forward storage requests to iframe.js.
    const channel = Channel.extension(Channels.Extension);
    channel.allowOrigin("https://mapgenie.io");

    // Listens for storage request from content.js.
    const _winChannel = Channel.window(Channels.Extension, (message, sendResponse, sendError) => {
        const { type } = messageScheme.parse(message);
        switch (type) {
            case "has":
            case "get":
            case "set":
            case "remove":
            case "keys":
                channel.send(Channels.Mapgenie, message).then(sendResponse).catch(sendError);
                return ResponseType.Pending;
            default:
                return ResponseType.Handled;
        }
    });
}

export async function has<T = any>(key: string, timeout?: number): Promise<T> {
    return forwardMessage("has", key, undefined, timeout);
}

export async function get<T = any>(key: string, timeout?: number): Promise<T> {
    return forwardMessage("get", key, undefined, timeout);
}

export async function set(key: string, value: string, timeout?: number): Promise<void> {
    return forwardMessage("set", key, value, timeout);
}

export async function remove(key: string, timeout?: number): Promise<void> {
    return forwardMessage("remove", key, undefined, timeout);
}

export async function keys(timeout?: number): Promise<void> {
    return forwardMessage("keys", undefined, undefined, timeout);
}
