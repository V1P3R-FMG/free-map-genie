import { defineConfig, devices } from "@playwright/test";
import { globalCache } from "@global-cache/playwright";

const config = defineConfig({
  testDir: "e2e",

  workers: 1,

  // Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: !!process.env.CI,

  // Retry on CI only.
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI.

  reporter: "list",

  use: {
    // Collect trace when retrying the failed test.
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
      dependencies: ["setup"],
    },
    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
      },
      dependencies: ["setup"],
    },
  ],
});

export default globalCache.wrap(config);
