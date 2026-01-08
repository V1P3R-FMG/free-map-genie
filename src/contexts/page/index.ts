import "@/common/messaging/contexts/window";

import { Client } from "@/common/client";
import {
  loginAsMockedUser,
  makeUserPro,
  activateBlockedMapgenieScript,
  removeLocationsLimit,
  MapgenieAdBlocker,
} from "@/common/mapgenie";

export default defineUnlistedScript(async () => {
  MapgenieAdBlocker.start();

  if (window.mapData) {
    loginAsMockedUser();
    makeUserPro();
    removeLocationsLimit();

    const client = Client.forMap();
    // await client.storageRequestPersist();
    await client.migrate();

    if (window.user && window.mapData) {
      logger.debug("Loading migrated data into page context");
      const data = await client.getData();

      window.user.locations = data.locations;
      window.user.trackedCategoryIds = data.trackedCategoryIds;

      window.mapData.notes = data.notes;
      window.mapData.presets = data.presets;
    }

    await activateBlockedMapgenieScript("map");
    await client.installInterceptor();
  }

  logger.log("Page script initialized.");
});
