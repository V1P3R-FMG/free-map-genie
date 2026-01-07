export type MessageType = "invoke" | "callback" | "ping" | "pong";

export type MessageSender = "provider" | "user";

export interface Message<T = any> {
  id: string;
  type: MessageType;
  sender: MessageSender;
  path: string[];
  namespace: string;
  timeStamp: number;
  args?: any[];
  callbackIds?: string[];
  data?: T;
  error?: string;
}

type StrictMessage<T> = T extends Message
  ? Message extends T
    ? T
    : never
  : never;

export function isValidMessage<M extends Message>(
  message?: any
): message is StrictMessage<M> {
  return (
    typeof message === "object" &&
    message !== null &&
    message.id &&
    message.type &&
    message.sender &&
    message.path &&
    message.namespace &&
    message.timeStamp !== undefined
  );
}
