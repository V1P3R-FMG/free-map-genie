import { getData, setData } from "@shared/extension";

const RULES = [
    {
        id: 1,
        priority: 1,
        action: { type: "block" as chrome.declarativeNetRequest.RuleActionType.BLOCK },
        condition: {
            regexFilter: "^https://cdn\\.mapgenie\\.io/js/map\\.js\\?id=\\w+$",
            resourceTypes: ["script" as chrome.declarativeNetRequest.ResourceType.SCRIPT]
        }
    }
];

async function isDeclarativeNetRequestsEnabled(): Promise<boolean> {
    const data = await getData();
    return data.settings.extension_enabled && data.settings.use_declarative_net_request;
}

function isDeclarativeNetRequestsChanged(changes: Record<string, chrome.storage.StorageChange>): boolean {
    if (!changes.settings) return false;
    return true
        || changes.settings.newValue.use_declarative_net_request 
            != changes.settings.oldValue.use_declarative_net_request
        || changes.settings.newValue.extension_enabled
            != changes.settings.oldValue.extension_enabled;
}

async function disableDeclarativeNetRequestsOptions() {
    const data = await getData();
    data.settings.use_declarative_net_request = false;
    await setData(data);
}

function enableDeclarativeNetRequestRules() {
    logger.debug("Enabled DNR Rules");
    if (chrome.declarativeNetRequest) {
        chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: RULES.map(r => r.id),
            addRules: RULES,
        });
    } else {
        console.warn("Browser does not support.");
        disableDeclarativeNetRequestsOptions();
    }
}

function disableDeclarativeNetRequestRules() {
    logger.debug("Disabled DNR rules");
    if (chrome.declarativeNetRequest) {
        chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: RULES.map(r => r.id),
        });
    } else {
        console.warn("Browser does not support.");
        disableDeclarativeNetRequestsOptions();
    }
}

async function init() {
    if (await isDeclarativeNetRequestsEnabled()) {
        enableDeclarativeNetRequestRules();
    } else if (chrome.declarativeNetRequest) {
        disableDeclarativeNetRequestRules();
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
