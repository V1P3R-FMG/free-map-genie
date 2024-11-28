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
    DriverState,
} from "./types";

export interface TimeoutInfo {
    time?: number;
    message?: string;
}

export interface ChannelSendMessageBinded<C extends ChannelContext, RC extends Exclude<ChannelContext, C>> {
    <T extends ChannelEventNames<RC>>(
        type: T,
        data: ChannelEventData<RC, T>,
        timeout?: number
    ): Promise<ChannelEventRet<RC, T>>;
}

export interface ChannelSendMessage<C extends ChannelContext> {
    <RC extends Exclude<ChannelContext, C>, T extends ChannelEventNames<RC>>(
        context: RC,
        type: T,
        data: ChannelEventData<RC, T>,
        timeout?: number
    ): Promise<ChannelEventRet<RC, T>>;
}

export interface Channel<C extends ChannelContext> {
    sendMessage: ChannelSendMessage<C>;

    bindSendMessage<RC extends Exclude<ChannelContext, C>>(context: RC): ChannelSendMessageBinded<C, RC>;

    onMessage<T extends ChannelEventNames<C>>(type: T, cb: MessageHandler<C, T>): void;

    handleMessage(message: any): void;

    isMessageForMe(message: InternalMessage): boolean;

    connect(): void;
    disconnect(): void;
    state: DriverState;
}

type Handler = (data: any) => any;

interface ResponseHandler {
    resolve: Handler;
    reject: Handler;
}

function stringifyError(err: any) {
    if (err instanceof Error) {
        return err.stack || err.message;
    } else if (typeof err === "object") {
        return JSON.stringify(err);
    } else if (typeof err === "symbol") {
        return err.toString();
    } else if (typeof err === "function") {
        return err.toString();
    } else {
        return `${err}`;
    }
}

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
                new Promise<any>((resolve, reject) => {
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
            driver.postMessage(createErrorResponse(message, `No message handler for ${message.type} @ ${context}`));
            return;
        }

        try {
            const data = await handler(message.data);
            driver.postMessage(createResponse(message, data));
        } catch (err) {
            driver.postMessage(createErrorResponse(message, stringifyError(err)));
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

    function bindSendMessage<RC extends Exclude<ChannelContext, C>>(context: RC) {
        return sendMessage.bind(null, context) as ChannelSendMessageBinded<C, RC>;
    }

    driver.onMessage(handleMessage);

    return {
        bindSendMessage,
        onMessage,
        sendMessage,
        handleMessage,
        isMessageForMe,
        connect: driver.connect,
        disconnect: driver.disconnect,
        get state() {
            return driver.state;
        },
    };
}
