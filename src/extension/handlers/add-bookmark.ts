/**
 * Sends bookmark data to the popup.
 * @param _ shared data
 * @param sendResponse the send response function
 * @returns a boolean that indicates if the sendResponse function will be called asynchronously.
 */
export default function addBookmark(
    _: any,
    sendResponse: (response: any) => void
) {
    const $url = document.head.querySelector(
        "meta[property='og:url']"
    ) as HTMLMetaElement;
    const $icon = document.head.querySelector(
        "link[rel='icon'][sizes='32x32']"
    ) as HTMLLinkElement;
    const $title = document.head.querySelector(
        "meta[property='og:title']"
    ) as HTMLMetaElement;

    if (!$url || !$icon || !$title) {
        console.warn("failed to add bookmark", {
            url: $url,
            icon: $icon,
            title: $title
        });
        return;
    }

    const url = $url.content;
    const favicon = $icon.href;
    const title =
        $title.content.match(/(.+?) (Interactive )?Map \| Map Genie/)?.[1] ||
        "";

    sendResponse({
        url,
        favicon,
        title
    });

    return true;
}
