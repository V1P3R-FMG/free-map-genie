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
    window.location.host === "mapgenie.io" && window.location.pathname === "/"
  );
};

const hasMapgenieCndUrl = () => {
  return $(`[href*="cdn.mapgenie.io"]`).length > 0;
};

const hasMapgeniePrebid = () => {
  return $(`[src$="mapgenie.prebid.js"]`).length > 0;
};

const isMapgenieSite = () => {
  return hasMapgenieCndUrl() || hasMapgeniePrebid();
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
