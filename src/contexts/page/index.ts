import "@/common/messaging/contexts/window";

import {
  MapgenieAdBlocker,
  getPageType,
  getAuthToken,
  type PageType,
} from "@/common/mapgenie";

import pageService from "@/services/page.service";
import extensionService from "@/services/extension.service";
import backendService from "@/services/backend.service";

import { HomePage } from "./pages/home";
import { GameHomePage } from "./pages/game-home";
import { MapPage } from "./pages/map";
import { GuidePage } from "./pages/guide";
import { LoginPage } from "./pages/login";

const FMG = Symbol.for("FMG");

declare global {
  interface Window {
    [FMG]?: boolean;
  }
}

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
    case "login":
      return new LoginPage();
    default:
      return null;
  }
};

const checkReload = () => {
  if (FMG in window) {
    window.location.reload();
  } else {
    window[FMG] = true;
  }
};

const initializeBackendUserState = async (
  backend: backendService.Instance
) => {
  try {
    // Set auth token in backend service
    const auth = getAuthToken();
    await backend.setAuthToken(auth);
    await backend.updateUser();
  } catch (err) {
    logger.debug(
      "Could not refresh MapGenie account profile; continuing with local FMG data.",
      err
    );
  }
};

export default defineUnlistedScript(async () => {
  const extension = extensionService.use();
  let failed: boolean = false;
  let pageType: PageType = "unknown";
  let pageScript: Awaited<ReturnType<typeof getPageScript>> = null;

  try {
    const backend = backendService.use();

    pageType = await getPageType();
    pageScript = await getPageScript(pageType);

    if (!pageScript) return;

    void initializeBackendUserState(backend);

    // Reload if script was already injected
    checkReload();

    logger.log(`Initializing page ${pageType} script.`);

    MapgenieAdBlocker.start();
    MapgenieAdBlocker.removePrivacyPopup();

    await pageScript.start();

    logger.log(`Page ${pageType} script initialized.`);
  } catch (err) {
    failed = true;

    logger.error(`Page ${pageType} script failed to initialize.`, err);
  } finally {
    await extension.unmountLoadingOverlay();
  }

  if (pageScript) {
    pageService.provide({ failed, page: pageScript });
  }
});
