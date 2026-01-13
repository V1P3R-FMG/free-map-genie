import { waitForBody } from "@/common/dom";

export { default as MapgenieAdBlocker } from "./ads";

export * as mapDataUtils from "./data";

/**
 * This function reloads a blocked mapgenie script.
 * The background script blocks certain mapgenie scripts from loading.
 * We simply append ready to the script URL and re-insert it into the DOM.
 * The background script will allow it to load this time.
 */
export const activateBlockedMapgenieScript = async (name: string) => {
  await waitForBody();

  const $ogScript = $(
    `script[src^="https://cdn.mapgenie.io/js/${name}.js?id="]`
  );

  if ($ogScript.length === 0) {
    return false;
  }

  const src = $ogScript.attr("src")!.replace("id=", "ready&id=");

  $(`<script/>`, { src }).appendTo("body");
};

export const loginAsUser = (id: number) => {
  window.user = {
    id,
    hasPro: false,
    locations: {},
    trackedCategoryIds: [],
    role: "user",
    suggestions: [],
  };
};

export const removeLocationsLimit = () => {
  if (window.mapData) {
    window.mapData.maxMarkedLocations = Infinity;
  } else {
    logger.warn(
      "Failed to remove locations limit: mapData is not defined on window"
    );
  }
};
