export default async function installRules() {
    await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [1],
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
        ],
    });
}
