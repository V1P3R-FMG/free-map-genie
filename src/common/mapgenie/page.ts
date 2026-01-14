import { waitForBody } from "@/common/dom";

export type PageType =
  | "home"
  | "game-home"
  | "map"
  | "guide"
  | "tarkov-quests-17"
  | "unknown";

const isHomePage = () => {
  return (
    window.location.host === "mapgenie.io" && window.location.pathname === "/"
  );
};

const isMapgenieSite = () => {
  return $(`[href*="cdn.mapgenie.io"]`).length > 0;
};

export const getPageType = async () => {
  if (isHomePage()) {
    return "home";
  }

  if (!isMapgenieSite()) {
    return "unknown";
  }

  const $body = $(await waitForBody());

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
