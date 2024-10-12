declare global {
    export interface Channels {
        [x: string]: ChannelEventMap;
    }
}

export interface ConnectionArgs {
    context: string;
    fingerprint: Fingerprint;
}

export interface PortInfo {
    tabId?: number;
    frameId?: number;
}

export interface ConnectionArgsWithEndpoint extends ConnectionArgs {
    endpointName: string;
}

export interface EndpointNameArgs extends PortInfo {
    context: string;
}

export type ChannelContext = "content-script" | "extension" | "popup" | "background" | "offscreen";

export type MessageType = "message" | "reply" | "error";

export interface MessageSender extends PortInfo {
    context: ChannelContext;
}

export interface MessageTarget extends PortInfo {
    context: ChannelContext;
}

export interface InternalMessage {
    messageId: MessageID;
    messageType: MessageType;
    hops: Record<string, true>;
    type: string;
    data: any;
    sender: MessageSender;
    target: MessageTarget;
    source: string[];
}

export interface DriverOnMessageCallback {
    (message: any): void;
}

export interface ChannelDriver {
    postMessage(message: InternalMessage): void;
    onMessage(cb: DriverOnMessageCallback): void;
    disconnect(): void;
}

export type Fingerprint = `uid::${string}`;
export type MessageID = `uid::${string}`;

export type EmptyEventArgs = Record<PropertyKey, never>;

export type ChannelEventDef<Data extends object | void = void, Ret = void> = {
    data: Data extends void ? EmptyEventArgs : Data;
    ret: Ret;
};

export interface MessageHandler<C extends ChannelContext, T extends ChannelEventNames<C>> {
    (
        data: ChannelEventData<C, T>
    ): ChannelEventRet<C, T> extends void ? any : ChannelEventRet<C, T> | Promise<ChannelEventRet<C, T>>;
}

export type ChannelEventNames<C extends ChannelContext> = keyof Channels[C];

export type ChannelEvent<C extends ChannelContext, T extends ChannelEventNames<C>> = Channels[C][T];

export type ChannelEventData<C extends ChannelContext, T extends ChannelEventNames<C>> =
    ChannelEvent<C, T> extends ChannelEventDef<any, any> ? ChannelEvent<C, T>["data"] : any;

export type ChannelEventRet<C extends ChannelContext, T extends ChannelEventNames<C>> =
    ChannelEvent<C, T> extends ChannelEventDef<any, any> ? ChannelEvent<C, T>["ret"] : any;

export interface ChannelEventMap {
    [name: string]: {
        data: object | void;
        ret: any;
    };
}
