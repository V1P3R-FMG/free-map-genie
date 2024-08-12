function offscreenDocumentReason(reason: `${chrome.offscreen.Reason}`): chrome.offscreen.Reason {
    return reason as chrome.offscreen.Reason;
}

function contextType(type: `${chrome.runtime.ContextType}`): chrome.runtime.ContextType {
    return type as chrome.runtime.ContextType;
}

export default async function createStorageIframe() {
    const existingContexts = await chrome.runtime.getContexts({
        contextTypes: [contextType("OFFSCREEN_DOCUMENT")],
        documentUrls: [chrome.runtime.getURL("storage/offscreen.html")],
    });

    if (existingContexts.length > 0) {
        return;
    }

    await chrome.offscreen.createDocument({
        url: "storage/offscreen.html",
        reasons: [offscreenDocumentReason("LOCAL_STORAGE")],
        justification: "saving / loading user data",
    });
}
