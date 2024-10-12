import * as async from "@utils/async";

import {
    createMessage,
    createResponse,
    createErrorResponse,
    isInternalMessage,
    isMessageFor,
    prettyMessage,
} from "./message";
import type {
    ChannelContext,
    ChannelDriver,
    InternalMessage,
    MessageID,
    ChannelEventData,
    ChannelEventNames,
    MessageHandler,
    ChannelEventRet,
} from "./types";

export interface TimeoutInfo {
    time?: number;
    message?: string;
}

export interface Channel<C extends ChannelContext> {
    sendMessage<RC extends Exclude<ChannelContext, C>, T extends ChannelEventNames<RC>>(
        context: RC,
        type: T,
        data: ChannelEventData<RC, T> extends void ? any : ChannelEventData<RC, T>,
        timeout?: number
    ): Promise<ChannelEventRet<RC, T>>;
    onMessage<T extends ChannelEventNames<C>>(type: T, cb: MessageHandler<C, T>): void;
    handleMessage(message: any): void;
    isMessageForMe(message: InternalMessage): boolean;
    disconnect(): void;
}

type Handler = (data: any) => any;

type ResponseHandler = {
    resolve: Handler;
    reject: Handler;
};

export class DuplicateHandlerError extends Error {
    public readonly handler: Handler;

    public constructor(handler: Handler) {
        super("Duplicate handler");
        this.handler = handler;
    }
}

export function createChannel<C extends ChannelContext>(context: C, driver: ChannelDriver): Channel<C> {
    const handlers: Record<any, Handler> = {};
    const responseHandlers: Record<MessageID, ResponseHandler> = {};

    const sender = { context };

    function onMessage<T extends ChannelEventNames<C>>(type: T, cb: Handler) {
        if (type in handlers) throw new DuplicateHandlerError(cb);
        handlers[type] = cb;
    }

    async function sendMessage<RC extends Exclude<ChannelContext, C>, T extends ChannelEventNames<RC>>(
        context: RC,
        type: T,
        data: ChannelEventData<RC, T>,
        timeout: number = async.DEFAULT_TIMEOUT
    ) {
        const target = { context };

        const message = createMessage(sender, target, "message", type as string, data);

        return async
            .timeout(
                new Promise((resolve, reject) => {
                    responseHandlers[message.messageId] = { resolve, reject };
                    driver.postMessage(message);
                }),
                timeout,
                `Channel ${prettyMessage(message)} took to long to respond.`
            )
            .catch((err) => {
                delete responseHandlers[message.messageId];
                throw err;
            });
    }

    async function handleResponse(message: InternalMessage) {
        const responseHandler = responseHandlers[message.messageId];

        if (!responseHandler) {
            logging.warn(`No response handler for ${prettyMessage(message)}`, message);
            return;
        }

        switch (message.messageType) {
            case "reply":
                responseHandler.resolve(message.data);
                delete responseHandlers[message.messageId];
                return;
            case "error":
                responseHandler.reject(message.data);
                delete responseHandlers[message.messageId];
                return;
            default:
                throw "Internal Error";
        }
    }

    async function handlePostMessage(message: InternalMessage) {
        const handler = handlers[message.type];

        if (!handler) {
            logging.warn(`No message handler for ${message.type} @ ${context}`, message);
            return;
        }

        try {
            const data = await handler(message.data);
            driver.postMessage(createResponse(message, data));
        } catch (err) {
            driver.postMessage(createErrorResponse(message, err));
        }
    }

    async function handleMessage(message: InternalMessage) {
        if (!isInternalMessage(message)) return;
        if (!isMessageForMe(message)) return;

        switch (message.messageType) {
            case "message":
                await handlePostMessage(message);
                return;
            case "reply":
            case "error":
                await handleResponse(message);
                return;
        }
    }

    function isMessageForMe(message: InternalMessage) {
        return isMessageFor(context, message);
    }

    function disconnect() {
        driver.disconnect();
    }

    driver.onMessage(handleMessage);

    return {
        onMessage,
        sendMessage,
        handleMessage,
        isMessageForMe,
        disconnect,
    };
}
