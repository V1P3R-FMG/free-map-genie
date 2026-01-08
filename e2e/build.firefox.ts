import { test as setup } from "@playwright/test";
import { build } from "wxt";

setup("Build firefox extension", async ({}) => {
  await build({
    browser: "firefox",
  });
  console.log("Firefox extension build");
});
