import { formatEndpointName } from "./connection-args";
import type { ChannelContext, InternalMessage, MessageID, MessageSender, MessageTarget, MessageType } from "./types";
import uid from "tiny-uid";

export const MESSAGE_ID_LENGTH = 14;
export const MESSAGE_ID_PREFIX = "uid::" as const;
export const MESSAGE_ID_FULL_LENGTH = MESSAGE_ID_PREFIX.length + MESSAGE_ID_LENGTH;

const VALID_INTERNAL_MESSAGES_KEYS = [
    "type",
    "messageId",
    "messageType",
    "sender",
    "target",
    "hops",
] as const satisfies (keyof InternalMessage)[];

export type FillInternalMessage = {
    [K in keyof InternalMessage]?: () => Required<InternalMessage[K]> | Promise<Required<InternalMessage[K]>>;
};

export function prettyMessage(message: InternalMessage): string {
    return `message ${message.messageId} [${formatEndpointName(message.sender)} -> ${formatEndpointName(message.target)}]{ type: ${message.type} }`;
}

export function isInternalMessage(message: any): message is InternalMessage {
    try {
        return VALID_INTERNAL_MESSAGES_KEYS.every((key) => key in message);
    } catch {
        return false;
    }
}

export function isMessageFor(context: ChannelContext | ChannelContext[], message: InternalMessage) {
    context = Array.isArray(context) ? context : [context];
    return context.some((c) => message.target.context === c);
}

export function isMessageFrom(context: ChannelContext | ChannelContext[], message: InternalMessage) {
    context = Array.isArray(context) ? context : [context];
    return context.some((c) => message.sender.context === c);
}

export function isMessageOnTrace(
    sender: ChannelContext | ChannelContext[],
    target: ChannelContext | ChannelContext[],
    message: InternalMessage
) {
    return isMessageFrom(sender, message) && isMessageFor(target, message);
}

export function createMessageId(): MessageID {
    return `${MESSAGE_ID_PREFIX}${uid(MESSAGE_ID_LENGTH)}`;
}

export function isValidMessageId(messageId: string): messageId is MessageID {
    return messageId.startsWith(MESSAGE_ID_PREFIX) && messageId.length === MESSAGE_ID_FULL_LENGTH;
}

export function hopMessage(message: InternalMessage, context: ChannelContext): InternalMessage {
    return (message.hops[context] = true), message;
}

export function hasMessageHop(message: InternalMessage, context: ChannelContext): boolean {
    return message.hops[context] ?? false;
}

export function createMessage(
    sender: MessageSender,
    target: MessageTarget,
    messageType: MessageType,
    type: string,
    data: any,
    messageId?: MessageID
): InternalMessage {
    return {
        hops: {},
        sender,
        target,
        type: type as string,
        data,
        messageId: messageId ?? createMessageId(),
        messageType,
        source: ["react"],
    };
}

export function createResponse(message: InternalMessage, data: any): InternalMessage {
    return createMessage(message.target, message.sender, "reply", "", data, message.messageId);
}

export function createErrorResponse(message: InternalMessage, data: string): InternalMessage {
    return createMessage(message.target, message.sender, "error", "", data, message.messageId);
}
