import { test, expect } from "./fixtures";
import { MapPage } from "./pages/map";

test("Load map page and verify title", async ({ page }) => {
  const mapPage = new MapPage(page);

  await mapPage.open("tarkov", "factory");

  expect(await page.title()).toEqual(
    "Factory | Escape From Tarkov Interactive Map | Map Genie"
  );
});
