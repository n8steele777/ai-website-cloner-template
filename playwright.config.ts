import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/a11y",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    // Dedicated port so `next dev` on :3000 does not block a11y runs locally.
    baseURL: "http://127.0.0.1:3001",
    trace: "on-first-retry",
    contextOptions: {
      // Deterministic axe runs: GSAP / AnimatedWords respect matchMedia (prefers-reduced-motion).
      reducedMotion: "reduce",
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    // Standalone output omits `public` / `.next/static`; mirror production Docker copy step.
    command:
      "rm -rf .next/standalone/public .next/standalone/.next/static && cp -r public .next/standalone/public && cp -r .next/static .next/standalone/.next/static && PORT=3001 HOSTNAME=127.0.0.1 node .next/standalone/server.js",
    url: "http://127.0.0.1:3001",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
