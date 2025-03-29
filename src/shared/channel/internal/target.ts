import type { ChannelContext, ChannelEventData, ChannelEventRet, EmptyEventArgs, Channels } from "./types";

import type { ChannelSendMessage } from ".";

export type ChannelTarget<C extends ChannelContext> = {
    [E in keyof Channels[C]]: ChannelEventData<C, E> extends EmptyEventArgs | void
        ? (data?: any, timeout?: number) => Promise<ChannelEventRet<C, E>>
        : (data: ChannelEventData<C, E>, timeout?: number) => Promise<ChannelEventRet<C, E>>;
};

export function createTarget<Sender extends ChannelContext, Target extends Exclude<ChannelContext, Sender>>(
    sendMessage: ChannelSendMessage<Sender>,
    context: Target
): Prettify<ChannelTarget<Target>> {
    function get(_: any, event: string) {
        return (data: any, timeout?: number) => {
            return sendMessage(context, event as keyof Channels[Target], data, timeout);
        };
    }
    return new Proxy({}, { get });
}
