import { getPageType } from "@fmg/page";

/**
 * Gives the requesting popup information about the current page.
 * @param _ shared data
 * @param sendResponse the send response function
 * @returns a boolean that indicates if the sendResponse function will be called asynchronously.
 */
export default function getInfo(
    shared: any,
    sendResponse: (response: any) => void
) {
    getPageType(window).then(pageType => {
        sendResponse({
            pageType,
            attached: shared.attached
        });
    });
    return true;
}
