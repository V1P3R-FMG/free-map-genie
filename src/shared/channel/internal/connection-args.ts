import { isValidFingerprint } from "./fingerprint";
import type { ChannelContext, ConnectionArgs, ConnectionArgsWithEndpoint, EndpointNameArgs } from "./types";

export function formatEndpointTargetName({ context, tabId }: EndpointNameArgs) {
    switch (context as ChannelContext) {
        case "background":
        case "popup":
        case "offscreen":
            return context;
        case "content-script":
            return formatEndpointName({ context: "extension", tabId });
        default:
            return formatEndpointName({ context, tabId });
    }
}

export function formatEndpointName({ context, tabId }: EndpointNameArgs) {
    return tabId !== undefined ? `${context}@${tabId}` : context;
}

export function encodeConnectionArgs({ context, fingerprint }: ConnectionArgs): string {
    return `${context}#${fingerprint}`;
}

export function decodeConnectionArgs(args: string, tabId?: number): ConnectionArgsWithEndpoint {
    const parts = args.split("#");
    const [context, fingerprint] = parts;

    if (parts.length !== 2) {
        throw "Invalid connection args.";
    }

    if (!isValidFingerprint(fingerprint)) {
        throw "Invalid fingerprint in connection args.";
    }

    return {
        context,
        endpointName: formatEndpointName({ context, tabId }),
        fingerprint,
    };
}
