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

export type DriverState = "connected" | "disconnected";

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
    connect(): void;
    disconnect(): void;
    state: DriverState;
}

export type Fingerprint = `uid::${string}`;
export type MessageID = `uid::${string}`;

export type EmptyEventArgs = Record<PropertyKey, never>;

export type ChannelEventDef<Data extends object | void = void, Ret = void> = (
    data?: Data extends void ? EmptyEventArgs : Data
) => Ret;

export interface MessageHandler<C extends ChannelContext, T extends ChannelEventNames<C>> {
    (
        data: ChannelEventData<C, T>
    ): ChannelEventRet<C, T> extends void ? any : ChannelEventRet<C, T> | Promise<ChannelEventRet<C, T>>;
}

export type ChannelEventNames<C extends ChannelContext> = keyof Channels[C];

export type ChannelEvent<C extends ChannelContext, T extends ChannelEventNames<C>> = Channels[C][T];

export type ChannelEventData<C extends ChannelContext, T extends ChannelEventNames<C>> =
    ChannelEvent<C, T> extends ChannelEventDef<any, any> ? Parameters<ChannelEvent<C, T>>[0] : any;

export type ChannelEventRet<C extends ChannelContext, T extends ChannelEventNames<C>> =
    ChannelEvent<C, T> extends ChannelEventDef<any, any> ? ReturnType<ChannelEvent<C, T>> : any;

export interface ChannelEventMap {
    [name: string]: ChannelEventDef<any, any>;
}

declare global {
    export interface BackgroundChannel {}
    export interface ExtensionChannel {}
    export interface ContentChannel {}
    export interface OffscreenChannel {}
    export interface PopupChannel {}
}

export interface Channels {
    "background": BackgroundChannel;
    "extension": ExtensionChannel;
    "content-script": ContentChannel;
    "offscreen": OffscreenChannel;
    "popup": PopupChannel;
}