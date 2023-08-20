/**
 * Tells the requesting popup that the extension is alive.
 * @param _ shared data
 * @param sendResponse the send response function
 * @returns a boolean that indicates if the sendResponse function will be called asynchronously.
 */
export default function getInfo(_: any, sendResponse: (response: any) => void) {
    sendResponse("Hello from the extension!");
    return true;
}
