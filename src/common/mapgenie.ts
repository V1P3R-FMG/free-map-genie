import { waitForBody } from "@/common/dom";

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

export const loginAsMockedUser = () => {
  window.user = {
    id: -1,
    hasPro: false,
    locations: {},
    trackedCategoryIds: [],
    role: "user",
    suggestions: [],
  };
};

export const makeUserPro = () => {
  if (window.user) {
    window.user.hasPro = true;
  }
};
