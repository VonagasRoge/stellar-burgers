import { defineConfig, devices } from '@playwright/test';

const BASE_URL = 'http://localhost:4000';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.pl.ts?(x)',
  fullyParallel: true,

  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },


  expect: { timeout: 10_000 },


  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],


  webServer: {
    command: 'npm run start',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
