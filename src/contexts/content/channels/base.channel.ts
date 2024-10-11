import {
    type ChannelEventData,
    type ChannelEventRet,
    type ChannelEventNames,
    sendMessage,
} from "@shared/channel/content";

export default class BaseChannel {
    protected sendBackground<T extends ChannelEventNames<"background">>(
        type: T,
        data: ChannelEventData<"background", T>,
        timeout?: number
    ): ChannelEventRet<"background", T> {
        return sendMessage("background", type, data, timeout);
    }

    protected sendExtension<T extends ChannelEventNames<"extension">>(
        type: T,
        data: ChannelEventData<"extension", T>,
        timeout?: number
    ) {
        return sendMessage("extension", type, data, timeout);
    }

    protected sendOffscreen<T extends ChannelEventNames<"offscreen">>(
        type: T,
        data: ChannelEventData<"offscreen", T>,
        timeout?: number
    ) {
        return sendMessage("offscreen", type, data, timeout);
    }
}
