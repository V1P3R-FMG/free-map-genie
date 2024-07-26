import { waitFor } from "@utils/async";

export type Id = ReturnType<typeof crypto.randomUUID>;

export type ChannelType = "window" | "extension";

export type ChannelMessageType = "ping" | "pong" | "send" | "response::success" | "response::failed";

export interface InternalResponseHandler {
    (ev: MessageEvent<any>): void;
}

export interface ResponseHandler {
    (ev: ChannelMessage): boolean;
}

export type BasicMessageSendAndResponseMap<S = any, R = any> = {
    [type: string]: [S, R];
};

export interface Handler {
    (message: any, sendResponse: (data: any) => any, sendError: (err: any) => any): Promise<boolean> | boolean;
}

export interface ChannelMessage {
    origin: string;
    sender: string;

    type: ChannelMessageType;
    target?: string;

    messageId: Id;
    data?: any;
}

export interface TargetContext {
    win: Window;
    host?: string;
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

export type PossibleArray<T> = T | T[];

export interface MatchOptions {
    sender?: string;
    messageId?: Id;
    type?: ChannelMessageType;
    data?: any;
}

export class ChannelRequestError extends Error {
    public constructor(message: ChannelMessage) {
        super(
            [
                `ChannelRequestError[${message.sender} >>> ${message.target ?? "BROADCAST"}]`,
                `    messageId: ${message.messageId}`,
                `    messageData: ${message.data}`,
            ].join("\n")
        );
    }
}

export class ChannelError extends Error {
    public constructor(message: any) {
        super(message);
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

export default class Channel<M extends BasicMessageSendAndResponseMap = any> {
    private static readonly extensionChannels: Record<string, Channel<any>> = {};
    private static readonly windowChannels: Record<string, Channel<any>> = {};

    public static readonly RETRY_INTERVAL = 1000;
    public static readonly VALID_MESSAGE_KEYS = ["type", "origin", "sender", "messageId"];

    public readonly name: string;
    public readonly id: Id;

    private readonly channelType: ChannelType;
    private readonly allowedOrigins: Set<string>;
    private readonly activeChannels: Record<string, true>;
    private readonly handlers: Handler[];
    private readonly responseHandlers: Record<Id, ResponseHandler>;

    private internalHandler?: InternalResponseHandler;

    /**
     * Check if channel is running.
     * @returns true if its is running.
     */
    public get running(): boolean {
        return this.internalHandler != null;
    }

    private constructor(channelType: ChannelType, name: string) {
        this.channelType = channelType;
        this.id = crypto.randomUUID();
        this.name = name;

        this.allowedOrigins = new Set();
        this.activeChannels = {};
        this.handlers = [];
        this.responseHandlers = {};

        this.allowOrigin("self");
        this.start();

        //logger.debug("new channel", this.name, this.id, this.channelType, logger.stack());
    }

    /**
     * Create a channel on in an extension context.
     * @param name the name of the channel.
     * @param handler the handler to handle sended messages with.
     * @returns The created channel
     */
    public static extension(name: string, handler?: Handler) {
        const channel = (this.extensionChannels[name] ??= new this("extension", name));
        if (handler) channel.addHandler(handler);
        return channel;
    }

    /**
     * Create a channel on a window object.
     * @param name the name of the channel.
     * @param handler the handler to handle sended messages with.
     * @returns The created channel
     */
    public static window(name: string, handler?: Handler) {
        const channel = (this.windowChannels[name] ??= new this("window", name));
        if (handler) channel.addHandler(handler);
        return channel;
    }

    /**
     * Adds an handler for incoming messages
     * @param handler the handler to add.
     */
    public addHandler(handler: Handler) {
        this.handlers.push(handler);
    }

    /**
     * Closes the channel listener.
     */
    public close() {
        if (!this.internalHandler) return;
        this.removeListenerForMessage(this.internalHandler);
        this.internalHandler = undefined;
    }

    /**
     * Starts the channel listener.
     */
    public start() {
        if (this.internalHandler) return;
        this.internalHandler = this.createInternalHandler();
        this.addListenerForMessage(this.internalHandler);
    }

    /**
     * Send data to the target channel.
     * @param target the target to send the data to.
     * @param data the data to send.
     * @param timeout the time after to reject the promise if not resolved yet.
     */
    public async send<R = any>(target: string, data: M, timeout: number = 10000): Promise<R> {
        if (target === this.name) {
            throw new ChannelError("Target and Sender are the same");
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
     * Adds an origin to the allowlist.
     * @param origin the origin to add. 'self' = window.location.origin.
     */
    public allowOrigin(origin: string) {
        if (origin === "self") origin = window.location.origin;
        this.allowedOrigins.add(origin);
    }

    /**
     * Sends a ping to the target channel and waits for a pong response.
     * @param name the name of the target channel to wait for.
     * @param timeout the time after to reject the promise if not resolved yet.
     * @returns Resolves when target response with pong.
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
                logger.warn("ChannelType", this.channelType, "has no postMessage implemented.");
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
                logger.warn("ChannelType", this.channelType, "has no postMessage implemented.");
                break;
        }
    }

    private removeListenerForMessage(handler: (e: any) => any) {
        switch (this.channelType) {
            case "window":
                window.removeEventListener("message", handler);
                break;
            case "extension":
                chrome.runtime.onMessage.removeListener(handler);
                break;
            default:
                logger.warn("ChannelType", this.channelType, "has no postMessage implemented.");
                break;
        }
    }

    /**
     * Generates a new messageId
     * @returns a uuid
     */
    private generateMessageId(): Id {
        return crypto.randomUUID();
    }

    /**
     * Creates a message and fills in extra info about sender, origin, ...
     * @param message the message to fill.
     * @returns the filled in message.
     */
    private createMessage(message: Omit<ChannelMessage, "origin" | "sender">): ChannelMessage {
        // const sender = `${this.name}::${this.channelType}`;
        return {
            origin: window.location.origin,
            sender: this.name,
            ...message,
        };
    }

    /**
     * Ads a response handler for a given messageId with match options.
     * @param messageId the id of the response to listen for.
     * @param responseMatch extra match options for the response.
     * @param resolve the callback to call with the response data when the response matches.
     */
    private addResponseHandler<R>(
        messageId: Id,
        successatch: MatchOptions,
        failedMatch: MatchOptions | undefined,
        resolve: (data: R) => any,
        reject: (e: any) => any
    ) {
        this.responseHandlers[messageId] ??= (response: ChannelMessage) => {
            if (this.messageMatches(response, successatch)) {
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
     * Send a message to other channels and waits for a response.
     * @param message the message to send.
     * @param options the options to create the message with.
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
     * Send a message to other channels.
     * @param message the message to send.
     * @param options the options to create the message with.
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
     * @param message the message to send the response for.
     * @param type the type for the response.
     * @param data the data for the response.
     */
    private respond(message: ChannelMessage, type: ChannelMessageType, data: any) {
        this.post({
            type,
            target: message.sender,
            messageId: message.messageId,
            data,
        });
    }

    /**
     * Check if the given object is a message.
     * @param data the message to check.
     * @returns the message if valid otherwise null.
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
     * Check if the message traget is this channel and that the sender is not this channel.
     * @param message the message to check.
     * @returns if the message is intended for this channel.
     */
    private isMessageForMe(message: ChannelMessage): boolean {
        if (message.sender === this.name) return false;
        if (!message.target) return true;
        return message.target === this.name;
    }

    /**
     * Checks if a message matches the provided match options.
     * @param message the message to check.
     * @param options the options to check the message with.
     * @returns if the message matched.
     */
    private messageMatches(message: ChannelMessage, options: MatchOptions): boolean {
        return Object.entries(options).every(([key, value]) => {
            return key in message && value === message[key as keyof ChannelMessage];
        });
    }

    /**
     * Checks if the origin is in the allow list.
     * @param e the message to extract the origin from.
     * @returns if the origin is allowed.
     */
    private checkOrigin(e: EventMessage): boolean {
        return e.origin ? this.allowedOrigins.has(e.origin) : true;
    }

    /**
     * Runs the provided handler provider when constructing.
     * @param message the message to handle.
     * @returns a boolean indicating if a response is allready or will be send.
     */
    private async runHandler(message: ChannelMessage): Promise<boolean> {
        // logger.debug("runHandler", message, this.handlers);
        for (const handler of this.handlers) {
            let hasResponded = false;
            let canResponse = true; // Handler is always allowed to response synchronous.

            const willRespond = await handler(
                message.data,
                (data) => {
                    if (!canResponse || hasResponded) throw new ChannelError("Response allready sended.");
                    hasResponded = true;
                    this.respond(message, "response::success", data);
                },
                (err) => {
                    if (!canResponse || hasResponded) throw new ChannelError("Response allready sended.");
                    hasResponded = true;
                    this.respond(message, "response::failed", err);
                }
            );

            canResponse = willRespond;

            if (willRespond || hasResponded) return true;
        }
        return false;
    }

    /**
     * Creates the internal handler.
     * The internal handler handles the incoming ChannelMessage.
     * @returns the internal handler.
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
                    const handler = this.responseHandlers[message.messageId];
                    if (handler!) {
                        if (!handler(message)) {
                            logger.warn("Invalid response", message, handler);
                        }
                        delete this.responseHandlers[message.messageId];
                    } else {
                        logger.warn("No handler for reponse", message, this.responseHandlers, this);
                    }
                    break;
                case "send":
                    this.runHandler(message)
                        .then((willRespond) => {
                            if (willRespond) return;
                            this.respond(message, "response::success", void 0);
                        })
                        .catch((e) => this.respond(message, "response::failed", e));
                    break;
                default:
                    logger.warn("Unknown Message Type", message);
                    break;
            }
        };
    }

    /**
     * Creates a array of values to pass down to console to display a more prettier message.
     * @param message the message to format.
     * @returns an array of values for the console.
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

        return [`<${type}>`, `[${sender} >>> ${target}] @ ${origin}`, data, messageId];
    }
}
