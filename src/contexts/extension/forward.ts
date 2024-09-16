import { Channels } from "@constants";

import { type MessageScheme as BackgroundMessageScheme } from "@background/index";
import { type MessageScheme as StorageMessageScheme } from "@storage/main";
import { type MessageScheme as ContentMessageScheme } from "@content/index";

import { extChannel, winChannel } from "./channels";

export async function forwardBackground(message: BackgroundMessageScheme) {
    return chrome.runtime.sendMessage(message);
}

export async function forwardStorage(message: StorageMessageScheme) {
    return extChannel.value.send(Channels.Mapgenie, message);
}

export async function forwardContent(message: ContentMessageScheme) {
    return winChannel.value.send(Channels.Content, message);
}
