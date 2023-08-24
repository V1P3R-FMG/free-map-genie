import hello from "./hello";
import addBookmark from "./add-bookmark";
import getInfo from "./get-info";
import forward from "./forward";

/**
 * The message handlers.
 */
const handlers: Record<string, any> = {
    hello: hello,
    "add-bookmark": addBookmark,
    "get-info": getInfo,
    "export-data": forward("export-data"),
    "import-data": forward("import-data"),
    "clear-data": forward("clear-data")
};

/**
 * Intializes the message handlers.
 * @param shared shared data between the handlers.
 */
export function initHandlers(shared: any) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        const handler = handlers[message.action];
        if (!handler) {
            return false;
        }
        return handler(shared, sendResponse);
    });
}
