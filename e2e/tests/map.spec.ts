import { test, expect } from "../fixtures";
import { MapPage } from "../pages/map";

test("Load map page and verify title", async ({
  page,
  extensionId,
  extensionBaseUrl,
}) => {
  console.log("Using extension ID:", extensionId);
  console.log("Base URL:", extensionBaseUrl);

  const mapPage = new MapPage(page);

  await mapPage.open("tarkov", "factory");

  await mapPage.waitForAxios();
  await mapPage.waitForAxiosInterceptor();

  await expect(
    mapPage.axios.get("/api/v1/games").then((res) => res.data)
  ).resolves.toEqual([
    {
      id: 1,
      name: "Mocked Game",
    },
  ]);
});
