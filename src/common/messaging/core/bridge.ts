import { isValidMessage } from "./message";

import type { Message } from "./message";
import type { Adapter } from "./adapter";

export interface BridgeMessage extends Message {
  hops?: string[];
}

export type FromAdapter<M extends Message = Message> = Omit<
  Adapter<M>,
  "sendMessage"
>;
export type ToAdapter<M extends Message = Message> = Omit<
  Adapter<M>,
  "onMessage"
>;

export interface OnWayBridgeOptions<M extends Message = Message> {
  name: string;
  from: FromAdapter<M>;
  to: ToAdapter<M>;
}

/**
 * Creates a bridge between 2 contexts | A --> B
 */
export const setupOneWayBridge = ({ name, from, to }: OnWayBridgeOptions) => {
  const namespacedHop = ({ sender, type }: BridgeMessage) => {
    return [sender, type, name].join("::");
  };

  const hopMessage = (message: BridgeMessage) => {
    const hop = namespacedHop(message);
    const previousHops = message.hops ?? [];
    const hops = [...previousHops, hop];
    return { ...message, hops };
  };

  const isAllreadyHopped = (message: BridgeMessage) => {
    const hop = namespacedHop(message);
    return message.hops?.includes(hop);
  };

  from.onMessage(async (message) => {
    if (!isValidMessage<BridgeMessage>(message)) return;
    if (isAllreadyHopped(message)) return;

    await to.sendMessage(hopMessage(message));
  });
};

/**
 * Creates a bridge between 2 contexts | A <-> B
 */
export const setupTwoWayBridge = (
  name: string,
  a: Adapter<BridgeMessage>,
  b: Adapter<BridgeMessage>
) => {
  setupOneWayBridge({ name, from: a, to: b });
  setupOneWayBridge({ name, from: b, to: a });
};
