import "@/common/messaging/contexts/window";

import testService from "@/services/test.service";

export default defineUnlistedScript(async () => {
  const test = testService.use();

  logger.log("counter:", await test.counter());
  logger.log("counter:", await test.counter());

  logger.log("memoizedCounter:", await test.memoizedCounter());
  logger.log("memoizedCounter:", await test.memoizedCounter());

  logger.log("Hello page!");
});
