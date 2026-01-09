import "@/common/messaging/contexts/window";

import { loginAsMockedUser, MapgenieAdBlocker } from "@/common/mapgenie";

import { getPageType } from "./type";
import { HomePage } from "./pages/home";
import { GameHomePage } from "./pages/game-home";
import { MapPage } from "./pages/map";
import { GuidePage } from "./pages/guide";

const getPage = async () => {
  const pageType = await getPageType();

  switch (pageType) {
    case "home":
      return new HomePage();
    case "game-home":
      return new GameHomePage();
    case "map":
      return new MapPage();
    case "guide":
      return new GuidePage();
    default:
      return null;
  }
};

export default defineUnlistedScript(async () => {
  const page = await getPage();
  if (!page) return;

  logger.debug("Initializing page script for", page.constructor.name);

  MapgenieAdBlocker.remove();
  MapgenieAdBlocker.removePrivacyPopup();

  if (!window.user) {
    loginAsMockedUser();
  }

  if (await page.canStart()) {
    await page.start();
  } else {
    await page.restore();
  }

  logger.log("Page script initialized.");
});
