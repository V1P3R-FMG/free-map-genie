import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "e2e/tests",

  // Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: !!process.env.CI,

  // Retry on CI only.
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI.

  reporter: "html",

  use: {
    // Collect trace when retrying the failed test.
    trace: "on-first-retry",
  },

  projects: [
    {
      testDir: "e2e",
      name: "build chrome extension",
      testMatch: /build.chrome\.ts/,
    },
    {
      testDir: "e2e",
      name: "build firefox extension",
      testMatch: /build.firefox\.ts/,
    },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["build chrome extension"],
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
      dependencies: ["build firefox extension"],
    },
  ],
});
