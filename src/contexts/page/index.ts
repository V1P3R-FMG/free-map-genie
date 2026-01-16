import "@/common/messaging/contexts/window";

import {
  MapgenieAdBlocker,
  getPageType,
  type PageType,
} from "@/common/mapgenie";

import pageService from "@/services/page.service";

import { HomePage } from "./pages/home";
import { GameHomePage } from "./pages/game-home";
import { MapPage } from "./pages/map";
import { GuidePage } from "./pages/guide";

const getPage = async (pageType: PageType) => {
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
  const pageType = await getPageType();
  const page = await getPage(pageType);
  if (!page) return;

  const params = new URLSearchParams(window.location.search);
  if (params.has("fmgBackend")) return;

  logger.log("Initializing page script for", pageType);

  MapgenieAdBlocker.remove();
  MapgenieAdBlocker.removePrivacyPopup();

  let failed: boolean = false;
  try {
    await page.start();
  } catch (err) {
    logger.debug("Page script failed to start.", err);
    failed = true;
  }

  pageService.provide({ failed, page });

  logger.log("Page script initialized.");
});
