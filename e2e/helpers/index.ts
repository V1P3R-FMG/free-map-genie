export * from "./firefox";

const EXTENSION_PROTOCOLS = ["chrome-extension://", "moz-extension://"];

export const wait = async (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const isExtensionUrl = (url: string) => {
  return EXTENSION_PROTOCOLS.some((protocol) => url.startsWith(protocol));
};
