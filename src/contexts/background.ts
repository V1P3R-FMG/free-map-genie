import "@/common/messaging/contexts/background";

import testService from "@/services/test.service";

export default defineBackground(() => {
  testService.provide();

  console.log("Hello background!", { id: browser.runtime.id });
});
