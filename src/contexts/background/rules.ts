const addRulesViaDeclarativeNetRequest = async () => {
  logger.debug("Using declarativeNetRequest to modify headers for mapgenie.io");

  await browser.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1],
    addRules: [
      {
        id: 1,
        action: {
          type: "modifyHeaders",
          responseHeaders: [
            {
              header: "X-Frame-Options",
              operation: "remove",
            },
            {
              header: "Frame-Options",
              operation: "remove",
            },
          ],
        },
        condition: {
          requestDomains: ["mapgenie.io"],
          resourceTypes: ["sub_frame"],
        },
      },
    ],
  });
};

const addRulesViaWebRequest = () => {
  logger.debug("Using webRequest to modify headers for mapgenie.io");

  const headersToRemove = ["X-Frame-Options", "Frame-Options"];

  browser.webRequest.onHeadersReceived.addListener(
    (e) => {
      const filteredHeaders = e.responseHeaders?.filter(
        ({ name }) => !headersToRemove.includes(name)
      );
      return { responseHeaders: filteredHeaders };
    },
    {
      urls: ["*://mapgenie.io/"],
    },
    ["blocking", "responseHeaders"]
  );
};

export async function addRules() {
  if (browser.declarativeNetRequest !== undefined) {
    await addRulesViaDeclarativeNetRequest();
  } else {
    addRulesViaWebRequest();
  }
}
