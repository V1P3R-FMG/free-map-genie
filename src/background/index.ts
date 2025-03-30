import channel from "@shared/channel/background";

import { initStorage } from "./storage";
import "./api";

declare global {
    interface BackgroundChannel {
        settingsChanged(data: { settings: FMG.Extension.Settings }): void;
    }
}

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

const BLOCK_MAP_SCRIPT_RULE = {
    id: 1,
    priority: 1,
    action: { type: "block" as chrome.declarativeNetRequest.RuleActionType.BLOCK },
    condition: {
        regexFilter: "^https://cdn\\.mapgenie\\.io/js/map\\.js\\?id=\\w+$",
        resourceTypes: ["script" as chrome.declarativeNetRequest.ResourceType.SCRIPT]
    }
};

const ALLOW_MAPGENIE_IFRAME_RULE = {
    id: 2,
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
};

const RULES = [BLOCK_MAP_SCRIPT_RULE, ALLOW_MAPGENIE_IFRAME_RULE];

channel.onMessage("settingsChanged", ({ settings }) => {
    if (settings.extension_enabled) {
        logger.debug("enabled script block");
        chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: [BLOCK_MAP_SCRIPT_RULE.id],
            addRules: [BLOCK_MAP_SCRIPT_RULE],
        });
    } else {
        logger.debug("disabled script block");
        chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: [BLOCK_MAP_SCRIPT_RULE.id],
        });
    }
});

async function init() {
    await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: RULES.map(r => r.id),
        addRules: RULES,
    });

    await initStorage();
}

init()
    .then(() => logger.log("background script loaded"))
    .catch(logger.error);