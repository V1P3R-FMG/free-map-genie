import { waitForBody } from "@/common/dom";

export type PageType =
  | "home"
  | "game-home"
  | "map"
  | "guide"
  | "tarkov-quests-17"
  | "login"
  | "unknown";

const isHomePage = () => {
  return (
    ["mapgenie.io", "www.mapgenie.io"].includes(window.location.host) &&
    window.location.pathname === "/"
  );
};

const hasMapgenieCdnUrl = () => {
  return $(`[href*="cdn.mapgenie.io"],[src*="cdn.mapgenie.io"]`).length > 0;
};

const hasMapgeniePrebid = () => {
  return $(`[src$="mapgenie.prebid.js"]`).length > 0;
};

const hasMapgenieMeta = () => {
  return (
    $(`meta[name="base-url"][content*="mapgenie"]`).length > 0 ||
    $(`meta[property="og:url"][content*="mapgenie"]`).length > 0 ||
    $(`link[rel="canonical"][href*="mapgenie"]`).length > 0
  );
};

const isMapgenieSite = () => {
  return hasMapgenieCdnUrl() || hasMapgeniePrebid() || hasMapgenieMeta();
};

export const getPageType = async () => {
  await waitForBody();

  if (isHomePage()) {
    return "home";
  }

  if (!isMapgenieSite()) {
    return "unknown";
  }

  if (window.location.pathname.endsWith("/login")) {
    return "login";
  }

  const $body = $(document.body);

  if ($body.hasClass("map")) {
    return "map";
  } else if ($body.hasClass("guide")) {
    return "guide";
  } else if ($body.hasClass("game-home")) {
    return "game-home";
  } else {
    return "unknown";
  }
};
