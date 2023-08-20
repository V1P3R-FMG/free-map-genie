import * as async from "./async";

export interface SendOptions {
    all?: boolean;
    retry?: boolean;
    timeout?: number;
}

/**
 * Checks if the given error is a connection error.
 * @param error The error to check.
 * @returns True if the error is a connection error.
 */
export function isConnectionError(error: Error): boolean {
    return !!error.message.match(
        "Could not establish connection. Receiving end does not exist."
    );
}

/**
 * Query for tabs.
 * @param options The options for the query.
 * @returns A promise that resolves to the tabs.
 */
export function queryTabs(
    options: SendOptions = {}
): Promise<chrome.tabs.Tab[]> {
    const queryOptions = options.all
        ? {}
        : { active: true, currentWindow: true };

    return new Promise((resolve, reject) => {
        chrome.tabs.query(queryOptions, (tabs) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(tabs);
            }
        });
    });
}

/**
 * Sends a message to the given tab.
 * @param tab The tab to send the message to.
 * @param message The message to send.
 * @returns A promise that resolves to the response.
 */
export function tabSendMessage<T = any>(
    tab: chrome.tabs.Tab,
    message: any
): Promise<T> {
    return new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(tab.id!, message, (response) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(response);
            }
        });
    });
}

/**
 * Try to send a message to a tab.
 * If it is a connection error, wait and try again.
 * @param tab The tab to send the message to.
 * @param message The message to send.
 * @param timeout The timeout for the send.
 */
export async function tabTrySendMessage<T = any>(
    tab: chrome.tabs.Tab,
    message: any,
    timeout: number = 6e4
): Promise<T> {
    return async.timeout(
        new Promise((resolve, reject) => {
            while (true) {
                return tabSendMessage(tab, message)
                    .then((res) => resolve(res))
                    .catch((err) => {
                        if (err && !isConnectionError(err)) {
                            reject(err);
                        } else {
                            return async
                                .sleep(500)
                                .then(() =>
                                    tabTrySendMessage(tab, message, timeout)
                                );
                        }
                    });
            }
        }),
        timeout
    );
}

/**
 * Sends a action and data to a tab and waits for a response.
 * @param action The action to send.
 * @param data The data to send.
 * @param options The options for the send.
 * @returns A promise that resolves to the response.
 */
export async function send(
    action: string,
    data?: any,
    options: SendOptions = { all: false, retry: false }
) {
    const tabs = await queryTabs(options);
    const responses = options.retry
        ? await Promise.all(
              tabs.map(
                  (tab) => tabTrySendMessage(tab, { action, data }),
                  options.timeout
              )
          )
        : await Promise.all(
              tabs.map((tab) => tabSendMessage(tab, { action, data }))
          );
    return responses.length == 1 ? responses[0] : responses;
}

/**
 * Reload the current tab.
 */
export async function reload() {
    const tabs = await queryTabs({ all: false });
    tabs.forEach((tab) => chrome.tabs.reload(tab.id!));
}
