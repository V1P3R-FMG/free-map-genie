export async function getActiveTab(): Promise<chrome.tabs.Tab | undefined> {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    return tabs[0];
}

export async function getActiveTabId() {
    const tab = await getActiveTab();
    return tab?.id;
}
