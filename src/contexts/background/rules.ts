const addRulesViaDeclarativeNetRequest = async () => {
  logger.debug("Using declarativeNetRequest to handle mapgenie.io requests");

  await browser.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1, 2, 3],
    addRules: [
      // Remove X-Frame-Options headers to allow embedding in iframe
      // So we can use it in our offscreen/background document to host our backend
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
      // Block mapgenie.io map script
      // We'll manually load it later after were done with the setup
      {
        id: 2,
        action: { type: "block" },
        condition: {
          requestDomains: ["cdn.mapgenie.io"],
          urlFilter: "/js/map.js?id=*",
          resourceTypes: ["script"],
        },
      },
      // Block mapgenie.io tarkov 17 quest script
      // We'll manually load it later after were done with the setup
      {
        id: 3,
        action: { type: "block" },
        condition: {
          requestDomains: ["cdn.mapgenie.io"],
          urlFilter: "/js/TarkovQuestToolWidget.js?id=*",
          resourceTypes: ["script"],
        },
      },
    ],
  });
};

const addRulesViaWebRequest = () => {
  logger.debug("Using webRequest to handle mapgenie.io requests");

  const headersToRemove = ["x-frame-options", "frame-options"];

  browser.webRequest.onHeadersReceived.addListener(
    (e) => ({
      responseHeaders: e.responseHeaders?.filter(
        ({ name }) => !headersToRemove.includes(name.toLowerCase())
      ),
    }),
    {
      urls: ["*://mapgenie.io/*"],
      types: ["sub_frame"],
    },
    ["blocking", "responseHeaders"]
  );

  browser.webRequest.onBeforeRequest.addListener(
    () => ({ cancel: true }),
    {
      urls: [
        "*://cdn.mapgenie.io/js/map.js?id=*",
        "*://cdn.mapgenie.io/js/TarkovQuestToolWidget.js?id=*",
      ],
      types: ["script"],
    },
    ["blocking"]
  );
};

export async function addRules() {
  if (browser.declarativeNetRequest !== undefined) {
    await addRulesViaDeclarativeNetRequest();
  } else {
    addRulesViaWebRequest();
  }
}
