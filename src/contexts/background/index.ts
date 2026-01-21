import "@/common/messaging/contexts/background";

import { createOffscreenDocument } from "./offscreen";
import { Rules } from "./rules";

import testService from "@/services/test.service";
import mapgenieService from "@/services/mapgenie.service";
import backgroundService from "@/services/background.service";
import { backgroundLoggerService } from "@/services/logger.service";

export default defineBackground(async () => {
  testService.provide();
  mapgenieService.provide();
  backgroundService.provide();
  backgroundLoggerService.provide();

  const rulesManager = new Rules();

  await rulesManager.enable();
  await createOffscreenDocument();

  logger.log("Hello background!", { id: browser.runtime.id });
});
