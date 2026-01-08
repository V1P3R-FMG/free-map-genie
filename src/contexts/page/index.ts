import "@/common/messaging/contexts/window";

import { waitForAxios } from "@/common/axios";
import { AxiosInterceptor } from "@/common/axios";
import {
  loginAsMockedUser,
  makeUserPro,
  activateBlockedMapgenieScript,
  removeLocationsLimit,
  MapgenieAdBlocker,
} from "@/common/mapgenie";

import testService from "@/services/test.service";
import mapgenieService from "@/services/mapgenie.service";

export default defineUnlistedScript(async () => {
  const test = testService.use();
  const mapgenie = mapgenieService.use();

  MapgenieAdBlocker.start();

  loginAsMockedUser();
  makeUserPro();
  removeLocationsLimit();

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

  const gamesA = await axios.get("/api/v1/games").then((res) => res.data);
  logger.log("Fetching games via axios...");
  logger.log("Games:", gamesA);

  const gamesB = await mapgenie.fetchGames();
  logger.log("Fetching games via MapgenieService...");
  logger.log("Games:", gamesB);

  const heatmaps = await mapgenie.fetchHeatmaps(1);
  logger.log("Fetching heatmaps for rdr2 via MapgenieService...");
  logger.log("Heatmaps:", heatmaps);

  logger.log("Hello page!");
});
