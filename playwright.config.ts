import { defineConfig, devices } from "@playwright/test";

const previewPort = process.env.PREVIEW_PORT ?? "4173";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  timeout: 60_000,
  reporter: [["list"]],
  expect: {
    timeout: 10_000,
  },
  globalSetup: "./tests/global-setup.ts",
  use: {
    ...devices["Desktop Chrome"],
    baseURL: `http://127.0.0.1:${previewPort}`,
    trace: "retain-on-failure",
  },
});
