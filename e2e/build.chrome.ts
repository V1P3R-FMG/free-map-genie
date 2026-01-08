import { test as setup } from "@playwright/test";
import { build } from "wxt";

setup("Build chrome extension", async ({}) => {
  await build({
    browser: "chrome",
  });
  console.log("Chrome extension build");
});
