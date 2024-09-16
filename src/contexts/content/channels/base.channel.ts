import Channel from "@shared/channel";
import { Channels } from "@constants";

import type { MessageScheme as BackgroundMessageScheme } from "@background/index";
import type { ExtensionMessageScheme } from "@extension/index";
import type { MessageScheme as IframeMessageScheme } from "contexts/storage/main";

export default class BaseChannel {
    private readonly channel = Channel.window(Channels.Content);

    protected sendBackground(message: BackgroundMessageScheme, timeout?: number) {
        // Still sending to extension but it will forward this message
        return this.channel.send(Channels.Extension, message, timeout);
    }

    protected sendExtension(message: ExtensionMessageScheme, timeout?: number) {
        return this.channel.send(Channels.Extension, message, timeout);
    }

    protected sendIframe(message: IframeMessageScheme, timeout?: number) {
        // Still sending to extension but it will forward this message
        return this.channel.send(Channels.Extension, message, timeout);
    }
}
