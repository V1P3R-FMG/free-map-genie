import { waitFor } from "@utils/async";

export type Id = ReturnType<typeof crypto.randomUUID>;

export type InternalResponseHandler = (ev: MessageEvent<any>) => void;

export type ResponseHandler = (ev: ChannelMessage) => boolean;

export type SendCallback = (data: any) => any;

export type Handler = (
    message: any,
    sendResponse: SendCallback,
    sendError: SendCallback
) => Promise<ResponseType> | ResponseType;

export type ChannelType = "window" | "extension";

export type ChannelMessageType = "ping" | "pong" | "send" | "response::success" | "response::failed";

export enum ResponseType {
    Handled = "handled",
    NotHandled = "not:handled",
    Pending = "pending",
}

export interface ChannelMessage {
    origin: string;
    sender: string;

    type: ChannelMessageType;
    target?: string;

    messageId: Id;
    data?: any;

    source: string[];
}

export interface EventMessage<T = any> {
    origin?: string;
    data?: T;
}

export interface PostOptions {
    type: ChannelMessageType;
    messageId?: Id;
    target?: string;
    data?: any;
}

export interface PostWithResponseOptions extends Omit<PostOptions, "messageId"> {
    successMatch: MatchOptions;
    failedMatch?: MatchOptions;
    interval?: number;
    timeout?: number;
}

export interface MatchOptions {
    sender?: string;
    messageId?: Id;
    type?: ChannelMessageType;
    data?: any;
}

export class ChannelRequestError extends Error {
    private readonly channelMessage: ChannelMessage;

    public constructor(message: ChannelMessage) {
        super(
            `ChannelRequestError[${message.sender} >>> ${message.target ?? "BROADCAST"}]\n` +
                `    messageId: ${message.messageId}\n`
        );
        this.channelMessage = message;
    }

    public get data(): any {
        return this.channelMessage.data;
    }
}

const ToStringPrototype = {
    toString() {
        const json = JSON.stringify(this);
        if (json.length > 32) {
            return `${json.substring(0, 32)}...`;
        }
        return json;
    },
};

export default class Channel<Send = any> {
    private static readonly extensionChannels: Record<string, Channel> = {};
    private static readonly windowChannels: Record<string, Channel> = {};

    public static readonly RETRY_INTERVAL = 1000;
    public static readonly VALID_MESSAGE_KEYS = ["type", "origin", "sender", "messageId"];

    public readonly name: string;
    public readonly id: Id;

    private readonly channelType: ChannelType;
    private readonly allowedOrigins: Set<string>;
    private readonly activeChannels: Record<string, true>;

    private readonly handlers: Handler[];
    private readonly responseHandlers: Record<Id, ResponseHandler>;

    private constructor(channelType: ChannelType, name: string) {
        this.channelType = channelType;
        this.id = crypto.randomUUID();
        this.name = name;

        this.allowedOrigins = new Set();
        this.activeChannels = {};
        this.handlers = [];
        this.responseHandlers = {};

        this.allowOrigin("self");

        this.addListenerForMessage(this.createInternalHandler());
    }

    /**
     * Create a channel on in an extension context
     * @param name the name of the channel
     * @param handler the handler to handle sended messages with
     */
    public static extension<Send>(name: string, handler?: Handler): Channel<Send> {
        const channel = (this.extensionChannels[name] ??= new this<Send>("extension", name));
        if (handler) channel.addHandler(handler);
        return channel;
    }

    /**
     * Create a channel on a window object
     * @param name the name of the channel
     * @param handler the handler to handle sended messages with
     */
    public static window<Send>(name: string, handler?: Handler): Channel<Send> {
        const channel = (this.windowChannels[name] ??= new this<Send>("window", name));
        if (handler) channel.addHandler(handler);
        return channel;
    }

    /**
     * Adds an handler for incoming messages
     * @param handler the handler to add
     */
    public addHandler(handler: Handler) {
        this.handlers.push(handler);
    }

    /**
     * Send data to the target channel
     * @param target the target to send the data to
     * @param data the data to send
     * @param timeout the time after to reject the promise if not resolved yet
     */
    public async send<R = any>(target: string, data: Send, timeout: number = 10000): Promise<R> {
        if (target === this.name) {
            throw "Target and Sender are the same";
        }

        if (!this.activeChannels[target]) {
            await this.waitForChannel(target, timeout);
        }

        return this.postWithResponse<R>({
            type: "send",
            target,
            data,
            successMatch: { type: "response::success" },
            failedMatch: { type: "response::failed" },
        });
    }

    /**
     * Adds an origin to the allowlist
     * @param origin the origin to add. 'self' = window.location.origin
     */
    public allowOrigin(origin: string) {
        if (origin === "self") origin = window.location.origin;
        this.allowedOrigins.add(origin);
    }

    /**
     * Sends a ping to the target channel and waits for a pong response
     * @param name the name of the target channel to wait for
     * @param timeout the time after to reject the promise if not resolved yet
     */
    private async waitForChannel(name: string, timeout: number): Promise<void> {
        if (this.activeChannels[name]) return;

        return this.postWithResponse({
            type: "ping",
            target: name,
            successMatch: { type: "pong" },
            timeout,
            interval: Channel.RETRY_INTERVAL,
        });
    }

    private postMessage(message: ChannelMessage) {
        switch (this.channelType) {
            case "window":
                window.postMessage(message);
                break;
            case "extension":
                chrome.runtime.sendMessage({ type: "channel", data: message });
                break;
            default:
                logger.error("ChannelType", this.channelType, "has no postMessage implemented.");
                break;
        }
    }

    private addListenerForMessage(handler: (e: any) => any) {
        switch (this.channelType) {
            case "window":
                window.addEventListener("message", handler);
                break;
            case "extension":
                chrome.runtime.onMessage.addListener(handler);
                break;
            default:
                logger.error("ChannelType", this.channelType, "has no postMessage implemented.");
                break;
        }
    }

    private _removeListenerForMessage(handler: (e: any) => any) {
        switch (this.channelType) {
            case "window":
                window.removeEventListener("message", handler);
                break;
            case "extension":
                chrome.runtime.onMessage.removeListener(handler);
                break;
            default:
                logger.error("ChannelType", this.channelType, "has no postMessage implemented.");
                break;
        }
    }

    /**
     * Generates a new messageId
     */
    private generateMessageId(): Id {
        return crypto.randomUUID();
    }

    /**
     * Creates a message and fills in extra info about sender, origin, ...
     * @param message the message to fill
     */
    private createMessage(message: Omit<ChannelMessage, "origin" | "sender" | "source">): ChannelMessage {
        // const sender = `${this.name}::${this.channelType}`;
        return {
            origin: window.location.origin,
            sender: this.name,
            source: ["react"], // just to silent map.js
            ...message,
        };
    }

    /**
     * Ads a response handler for a given messageId with match options
     * @param messageId the id of the response to listen for
     * @param responseMatch extra match options for the response
     * @param resolve the callback to call with the response data when the response matches
     */
    private addResponseHandler<R>(
        messageId: Id,
        successMatch: MatchOptions,
        failedMatch: MatchOptions | undefined,
        resolve: (data: R) => any,
        reject: (e: any) => any
    ) {
        this.responseHandlers[messageId] ??= (response: ChannelMessage) => {
            if (this.messageMatches(response, successMatch)) {
                resolve(response.data);
                return true;
            }

            if (!failedMatch) return false;

            if (this.messageMatches(response, failedMatch)) {
                reject(new ChannelRequestError(response));
                return true;
            }

            return false;
        };
    }

    /**
     * Send a message to other channels and waits for a response
     * @param message the message to send
     * @param options the options to create the message with
     */
    private postWithResponse<R>({
        type,
        data,
        target,
        successMatch,
        failedMatch,
        interval,
        timeout,
    }: PostWithResponseOptions): Promise<R> {
        const messageId = this.generateMessageId();
        const message = this.createMessage({ type, target, messageId, data });

        if (!interval) {
            return new Promise<R>((resolve, reject) => {
                this.addResponseHandler(messageId, successMatch, failedMatch, resolve, reject);
                this.postMessage(message);
            });
        } else {
            return waitFor(
                async (resolve, reject) => {
                    this.addResponseHandler(messageId, successMatch, failedMatch, resolve, reject);
                    this.postMessage(message);
                },
                {
                    interval,
                    timeout,
                    message: `Waiting for response for ${Channel.formatMessage(message).join(" ")} took to long`,
                }
            );
        }
    }

    /**
     * Send a message to other channels
     * @param message the message to send
     * @param options the options to create the message with
     */
    private post({ type, data, target, messageId }: PostOptions) {
        this.postMessage(
            this.createMessage({
                type,
                target,
                data,
                messageId: messageId ?? this.generateMessageId(),
            })
        );
    }

    /**
     * Send a response for a given message
     * @param message the message to send the response for
     * @param type the type for the response
     * @param data the data for the response
     */
    private respond(message: ChannelMessage, type: ChannelMessageType, data: any) {
        if (__DEBUG__ && type === "response::failed") debugger;
        this.post({
            type,
            target: message.sender,
            messageId: message.messageId,
            data,
        });
    }

    /**
     * Check if the given object is a message
     * @param data the message to check
     */
    public static getMessage(data: any): Nullable<ChannelMessage> {
        switch (typeof data) {
            case "object":
                if (Channel.VALID_MESSAGE_KEYS.every((key) => key in data)) {
                    return data as ChannelMessage;
                }
        }
        return null;
    }

    /**
     * Check if the message target is this channel and that the sender is not this channel
     * @param message the message to check
     */
    private isMessageForMe(message: ChannelMessage): boolean {
        if (message.sender === this.name) return false;
        if (!message.target) return true;
        return message.target === this.name;
    }

    /**
     * Checks if a message matches the provided match options
     * @param message the message to check
     * @param options the options to check the message with
     */
    private messageMatches(message: ChannelMessage, options: MatchOptions): boolean {
        return Object.entries(options).every(([key, value]) => {
            return key in message && value === message[key as keyof ChannelMessage];
        });
    }

    /**
     * Checks if the origin is in the allow list
     * @param e the message to extract the origin from
     */
    private checkOrigin(e: EventMessage): boolean {
        return e.origin ? this.allowedOrigins.has(e.origin) : true;
    }

    /**
     * Runs the provided handler provider when constructing
     * @param message the message to handle
     */
    private async runHandler(message: ChannelMessage): Promise<boolean> {
        const errors: unknown[] = [];

        for (const handler of this.handlers) {
            let hasResponded = false;
            let canResponse = true; // Handler is always allowed to response synchronous.

            try {
                const responseType = await handler(
                    message.data,
                    (data) => {
                        if (!canResponse || hasResponded) throw "Response already sended.";
                        hasResponded = true;
                        this.respond(message, "response::success", data);
                    },
                    (err) => {
                        if (!canResponse || hasResponded) throw "Response already sended.";
                        hasResponded = true;
                        this.respond(message, "response::failed", err);
                    }
                );

                canResponse = responseType === ResponseType.Handled || responseType === ResponseType.Pending;

                if (hasResponded) return true;
                if (responseType === ResponseType.Handled) return false;
                if (responseType === ResponseType.Pending) return true;
            } catch (e) {
                errors.push(e);
            }
        }

        if (errors.length > 0) {
            this.respond(message, "response::failed", errors);
            return true;
        }

        return false;
    }

    /**
     * Creates the internal handler
     * The internal handler handles the incoming ChannelMessage
     */
    private createInternalHandler(): InternalResponseHandler {
        return async (e: EventMessage) => {
            const message = Channel.getMessage(e.data);
            if (!message) return;

            this.activeChannels[message.sender] = true;
            if (!this.isMessageForMe(message)) return;

            if (!this.checkOrigin(e)) {
                logger.warn("Ignoring message because the origin was not allowed", ...Channel.formatMessage(e.data));
                return;
            }

            switch (message.type) {
                case "ping":
                    this.respond(message, "pong", undefined);
                    break;
                case "pong":
                case "response::success":
                case "response::failed":
                    this.handleResponseMessage(message);
                    break;
                case "send":
                    this.handleSendMessage(message);
                    break;
                default:
                    logger.warn("Unknown Message Type", message);
                    break;
            }
        };
    }

    /** Handle response messages */
    private handleResponseMessage(message: ChannelMessage) {
        const handler = this.responseHandlers[message.messageId];
        if (handler!) {
            if (!handler(message)) {
                logger.warn("Invalid response", message, handler);
            }
            delete this.responseHandlers[message.messageId];
        } else {
            logger.warn("No handler for response", message, this.responseHandlers, this);
        }
    }

    /** Handle send messages */
    private async handleSendMessage(message: ChannelMessage) {
        try {
            const willRespond = await this.runHandler(message);

            if (willRespond) return;

            this.respond(message, "response::success", void 0);
        } catch (e) {
            this.respond(message, "response::failed", e);
        }
    }

    /**
     * Creates a array of values to pass down to console to display a more prettier message
     * @param message the message to format
     */
    public static formatMessage(message: any): any[] {
        const msg = this.getMessage(message);
        if (!msg) return [message];

        const type = msg.type.toUpperCase();
        const sender = msg.sender;
        const target = msg.target ?? "BROADCAST";
        const origin = msg.origin;
        const messageId = msg.messageId;

        const data: any =
            typeof msg.data === "object" ? Object.setPrototypeOf({ ...msg.data }, ToStringPrototype) : msg.data;

        return [`#${messageId}<${type}> [${sender} >>> ${target}] @ ${origin}\n`, `DATA:`, data];
    }
}
