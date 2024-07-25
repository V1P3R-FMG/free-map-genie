export default async function installRules() {
    await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [1, 2],
        addRules: [
            // Allow https://mapgenie.io to be loaded as an iframe on other domains.
            {
                id: 1,
                priority: 1,
                action: {
                    type: chrome.declarativeNetRequest.RuleActionType
                        .MODIFY_HEADERS,
                    responseHeaders: ["X-Frame-Options", "Frame-Options"].map(
                        (header) => ({
                            header,
                            operation:
                                chrome.declarativeNetRequest.HeaderOperation
                                    .REMOVE,
                        })
                    ),
                },
                condition: {
                    requestDomains: ["mapgenie.io"],
                    resourceTypes: [
                        chrome.declarativeNetRequest.ResourceType.SUB_FRAME,
                    ],
                },
            },
            // Block map.js?id=123456abcdef but allow map.js?ready&id=123456abcdef
            // We block the script so the extension has time setup.
            // The extension will reinject the script but with ready in the search query after the setup.
            {
                id: 2,
                priority: 1,
                action: {
                    type: chrome.declarativeNetRequest.RuleActionType.BLOCK,
                },
                condition: {
                    regexFilter:
                        "^https://cdn\\.mapgenie\\.io/js/map\\.js\\?id=\\w+$",
                    resourceTypes: [
                        chrome.declarativeNetRequest.ResourceType.SCRIPT,
                    ],
                },
            },
        ],
    });
}
