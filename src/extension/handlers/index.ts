import hello from "./hello";
import addBookmark from "./add-bookmark";
import getInfo from "./get-info";
import forward from "./forward";
import exportData from "./export";
import importData from "./import";


/**
 * The message handlers.
 */
const handlers: Record<string, any> = {
    hello: hello,
    "add-bookmark": addBookmark,
    "get-info": getInfo,
    "export-data": exportData,
    "import-data": importData,
    "clear-data": forward("clear-data")
};

/**
 * Intializes the message handlers.
 * @param shared shared data between the handlers.
 */
export function initHandlers(shared: any) {
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
        const handler = handlers[message.action];
        if (!handler) {
            return false;
        }
        return handler(shared, message.data, sendResponse);
    });
}
