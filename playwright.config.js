// @ts-check
const { defineConfig, devices } = require("@playwright/test");

const PORT = 4173;

module.exports = defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: "retain-on-failure",
    video: "off"
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } }
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 5"], viewport: { width: 390, height: 844 } }
    }
  ],
  webServer: {
    command: "node scripts/serve-dist.js",
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: !process.env.CI,
    stdout: "ignore",
    stderr: "pipe",
    timeout: 20000
  }
});
