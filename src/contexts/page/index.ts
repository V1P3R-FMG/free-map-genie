import "@/common/messaging/contexts/window";

import {
  MapgenieAdBlocker,
  getPageType,
  type PageType,
} from "@/common/mapgenie";

import pageService from "@/services/page.service";
import extensionService from "@/services/extension.service";

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
  const extension = extensionService.use();

  const pageType = await getPageType();
  const page = await getPage(pageType);
  if (!page) return;

  logger.log("Initializing page script for", pageType);

  MapgenieAdBlocker.remove();
  MapgenieAdBlocker.removePrivacyPopup();

  let failed: boolean = false;
  try {
    await page.start();

    logger.log(`Page ${pageType} script initialized.`);
  } catch (err) {
    logger.error("Page script failed to start.", err);
    failed = true;
  } finally {
    await extension.unmountLoadingOverlay();
  }

  pageService.provide({ failed, page });
});
