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

const getPageScript = async (pageType: PageType) => {
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
  const pageScript = await getPageScript(pageType);

  if (!pageScript) return;

  logger.log(`Initializing page ${pageType} script.`);

  MapgenieAdBlocker.remove();
  MapgenieAdBlocker.removePrivacyPopup();

  let failed: boolean = false;
  try {
    await pageScript.start();

    logger.log(`Page ${pageType} script initialized.`);
  } catch (err) {
    failed = true;

    logger.error(`Page ${pageType} script failed to initialize.`, err);
  } finally {
    await extension.unmountLoadingOverlay();
  }

  pageService.provide({ failed, page: pageScript });
});
