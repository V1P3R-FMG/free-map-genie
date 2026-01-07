import "@/common/messaging/contexts/background";

import { createOffscreenDocument } from "./offscreen";

import testService from "@/services/test.service";

export default defineBackground(async () => {
  testService.provide();

  await createOffscreenDocument();

  console.log("Hello background!", { id: browser.runtime.id });
});
