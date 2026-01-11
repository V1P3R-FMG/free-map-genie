import { defineConfig, devices } from "@playwright/test";
import { globalCache } from "@vitalets/global-cache";

globalCache.defineConfig({
  basePath: "playwright/.cache/global-cache",
});

export default defineConfig({
  testDir: "e2e",

  workers: 1,

  // Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: !!process.env.CI,

  // Retry on CI only.
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI.

  reporter: "list",
  globalSetup: [globalCache.setup],
  globalTeardown: [globalCache.teardown],

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
