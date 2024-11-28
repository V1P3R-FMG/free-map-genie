import type { ChannelContext, ChannelEventData, ChannelEventRet, EmptyEventArgs } from "./types";

import type { ChannelSendMessage } from ".";

export type CamelCase<S extends PropertyKey> = S extends `${infer P1}:${infer P2}${infer P3}`
    ? `${Lowercase<P1>}${Uppercase<P2>}${CamelCase<P3>}`
    : S extends `${infer P1}`
      ? Lowercase<P1>
      : never;

export type ChannelTarget<C extends ChannelContext> = {
    [E in keyof Channels[C] as CamelCase<E>]: ChannelEventData<C, E> extends EmptyEventArgs
        ? (data?: any, timeout?: number) => Promise<ChannelEventRet<C, E>>
        : (data: ChannelEventData<C, E>, timeout?: number) => Promise<ChannelEventRet<C, E>>;
};

function toEventName<C extends ChannelContext>(event: string): keyof Channels[C] {
    return event.replace(/[A-Z]/g, (c: string) => `:${c.toLowerCase()}`) as keyof Channels[C];
}

export function createTarget<Sender extends ChannelContext, Target extends Exclude<ChannelContext, Sender>>(
    sendMessage: ChannelSendMessage<Sender>,
    context: Target
): Prettify<ChannelTarget<Target>> {
    const eventMapCache: Record<string, keyof Channels[Target]> = {};

    function get(_: any, prop: string) {
        const event = eventMapCache[prop] ?? (eventMapCache[prop] = toEventName<Target>(prop));

        return (data: any, timeout?: number) => {
            return sendMessage(context, event, data, timeout);
        };
    }

    return new Proxy({}, { get });
}
