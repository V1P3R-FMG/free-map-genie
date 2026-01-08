import "@/common/messaging/contexts/window";

import { waitForAxios } from "@/common/axios";
import { AxiosInterceptor } from "@/common/axios";
import {
  loginAsMockedUser,
  makeUserPro,
  activateBlockedMapgenieScript,
} from "@/common/mapgenie";

import testService from "@/services/test.service";

export default defineUnlistedScript(async () => {
  const test = testService.use();

  loginAsMockedUser();
  makeUserPro();

  await activateBlockedMapgenieScript("map");

  logger.log("counter:", await test.counter());
  logger.log("counter:", await test.counter());

  logger.log("memoizedCounter:", await test.memoizedCounter());
  logger.log("memoizedCounter:", await test.memoizedCounter());

  const axios = await waitForAxios();
  const interceptor = new AxiosInterceptor(axios);

  interceptor.get("/api/v1/games", (ctx) => {
    logger.debug("Intercepted GET /api/v1/games");
    ctx.block([
      {
        id: 1,
        name: "Mocked Game",
      },
    ]);
  });

  logger.log("Fetching games via axios...");
  logger.log("Games:", await axios.get("/api/v1/games"));

  logger.log("Hello page!");
});
