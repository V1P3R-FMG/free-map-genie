function offscreenDocumentReason(reason: `${chrome.offscreen.Reason}`): chrome.offscreen.Reason {
    return reason as chrome.offscreen.Reason;
}

function contextType(type: `${chrome.runtime.ContextType}`): chrome.runtime.ContextType {
    return type as chrome.runtime.ContextType;
}

async function createStorageIframe() {
    const existingContexts = await chrome.runtime.getContexts({
        contextTypes: [contextType("OFFSCREEN_DOCUMENT")],
        documentUrls: [chrome.runtime.getURL("storage.html")],
    });

    if (existingContexts.length) return;

    await chrome.offscreen.createDocument({
        url: "storage.html",
        reasons: [offscreenDocumentReason("IFRAME_SCRIPTING")],
        justification: "saving / loading user data",
    });
}

export async function initStorage() {
    if (__BROWSER__ === "chrome") {
        await createStorageIframe();
    }

    if (__BROWSER__ === "firefox") {
        const iframe = globalThis.document.querySelector("iframe");
        if (!iframe) throw "Failed to find iframe on background page.";

        iframe.src = iframe.src;
    }
}
