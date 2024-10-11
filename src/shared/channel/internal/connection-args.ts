import { isValidFingerprint } from "./fingerprint";
import type { ChannelContext, ConnectionArgs, ConnectionArgsWithEndpoint, EndpointNameArgs, PortInfo } from "./types";

export function formatEndpointTargetName({ context, tabId, frameId }: EndpointNameArgs) {
    switch (context as ChannelContext) {
        case "background":
        case "popup":
        case "offscreen":
            return context;
        case "content-script":
            return formatEndpointName({ context: "extension", tabId, frameId });
        default:
            return formatEndpointName({ context, tabId, frameId });
    }
}

export function formatEndpointName({ context, tabId, frameId }: EndpointNameArgs) {
    if (tabId !== undefined && frameId !== undefined) {
        return `${context}@${tabId}:${frameId}`;
    } else if (tabId !== undefined) {
        return `${context}@${tabId}`;
    }
    return context;
}

export function encodeConnectionArgs({ context, fingerprint }: ConnectionArgs): string {
    return `${context}#${fingerprint}`;
}

export function decodeConnectionArgs(args: string, portInfo: PortInfo): ConnectionArgsWithEndpoint {
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
        endpointName: formatEndpointName({ context, ...portInfo }),
        fingerprint,
    };
}
