import Channel from "@shared/channel";
import { Channels } from "@constants";

import type { MessageScheme as ExtensionMessageScheme } from "@extension/index";
import type { MessageScheme as IframeMessageSceme } from "@iframe/index";

export default class BaseChannel {
    private readonly extension = Channel.window(Channels.Content);

    protected sendExtension(message: ExtensionMessageScheme, timeout?: number) {
        return this.extension.send(Channels.Extension, message, timeout);
    }

    protected sendIframe(message: IframeMessageSceme, timeout?: number) {
        // Still sending to extension but it will forward this message
        return this.extension.send(Channels.Extension, message, timeout);
    }
}
