import "@/common/messaging/contexts/background";

import { createOffscreenDocument } from "./offscreen";
import { addRules } from "./rules";

import testService from "@/services/test.service";
import mapgenieService from "@/services/mapgenie.service";

export default defineBackground(async () => {
  testService.provide();
  mapgenieService.provide();

  await addRules();
  await createOffscreenDocument();

  logger.log("Hello background!", { id: browser.runtime.id });
});
