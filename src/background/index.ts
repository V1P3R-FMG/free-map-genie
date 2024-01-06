import { getData } from "@shared/extension";

const RULES = [
    {
        id: 1,
        priority: 1,
        action: { type: chrome.declarativeNetRequest.RuleActionType.BLOCK },
        condition: {
            regexFilter: "^https://cdn\\.mapgenie\\.io/js/map\\.js\\?id=\\w+$",
            resourceTypes: [chrome.declarativeNetRequest.ResourceType.SCRIPT]
        }
    }
];

async function isDeclarativeNetRequestsEnabled(): Promise<boolean> {
    const data = await getData();
    return data.settings.use_declarative_net_request;
}

function isDeclarativeNetRequestsChanged(changes: Record<string, chrome.storage.StorageChange>): boolean {
    if (!changes.settings) return false;
    return changes.settings.newValue.use_declarative_net_request 
        != changes.settings.oldValue.use_declarative_net_request;
}

function enableDeclarativeNetRequestRules() {
    logger.debug("Enabled DNR Rules");
    chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: RULES.map(r => r.id),
        addRules: RULES,
    });
}

function disableDeclarativeNetRequestRules() {
    logger.debug("Disabled DNR rules");
    chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: RULES.map(r => r.id),
    });
}

async function init() {
    if (await isDeclarativeNetRequestsEnabled() && chrome.declarativeNetRequest) {
        enableDeclarativeNetRequestRules();
    }

    chrome.storage.onChanged.addListener(async (changes, area) => {
        if (area !== "sync") return;
        if (isDeclarativeNetRequestsChanged(changes)) {
            if (await isDeclarativeNetRequestsEnabled()) {
                enableDeclarativeNetRequestRules();
            } else {
                disableDeclarativeNetRequestRules();
            }
        }
    });
}

init()
    .then(() => logger.log("background script loaded"))
    .catch(logger.error);
