type RuleActionType = chrome.declarativeNetRequest.RuleActionType;
type ResourceType = chrome.declarativeNetRequest.ResourceType;
type HeaderOperation = chrome.declarativeNetRequest.HeaderOperation;

function ruleActionType(type: `${RuleActionType}`): RuleActionType {
    return type as RuleActionType;
}

function resourceType(type: `${ResourceType}`): ResourceType {
    return type as ResourceType;
}

function headerOperation(operation: `${HeaderOperation}`): HeaderOperation {
    return operation as HeaderOperation;
}

export default async function installRules() {
    const rules: chrome.declarativeNetRequest.Rule[] = [];

    // Allow https://mapgenie.io to be loaded as an iframe on other domains.
    rules.push({
        id: 1,
        priority: 1,
        action: {
            type: ruleActionType("modifyHeaders"),
            responseHeaders: ["X-Frame-Options", "Frame-Options"].map((header) => ({
                header,
                operation: headerOperation("remove"),
            })),
        },
        condition: {
            requestDomains: ["mapgenie.io"],
            resourceTypes: __DEBUG__
                ? [resourceType("sub_frame"), resourceType("main_frame")]
                : [resourceType("sub_frame")],
        },
    });

    // Block map.js?id=123456abcdef but allow map.js?ready&id=123456abcdef
    // We block the script so the extension has time setup.
    // The extension will reinject the script but with ready in the search query after the setup.
    rules.push({
        id: 2,
        priority: 1,
        action: {
            type: ruleActionType("block"),
        },
        condition: {
            regexFilter: "^https://cdn\\.mapgenie\\.io/js/map\\.js\\?id=\\w+$",
            resourceTypes: [resourceType("script")],
        },
    });

    await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: rules.map((rule) => rule.id),
        addRules: rules,
    });
}
