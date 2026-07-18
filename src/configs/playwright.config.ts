import { Environment } from "@configs/environment.config";
import { SECOND_IN_MILISSECONDS } from "@data/constants/common.constants";
import { defineConfig, devices } from "@playwright/test";
import { DateTimeUtils } from "@utils/datetime.utils";
import * as os from "node:os";
import path from "node:path";
import { PATHS } from "./paths";

const globalLaunchOptions = {
  headless: Environment.HEADLESS,
  slowMo: Environment.SLOWMO,
};

export default defineConfig({
  testDir: "../tests/",
  timeout: 90 * SECOND_IN_MILISSECONDS,
  expect: {
    timeout: 5 * SECOND_IN_MILISSECONDS,
  },
  fullyParallel: true,
  retries: Environment.RETRIES,
  workers: Environment.WORKERS,
  globalTeardown: require.resolve(PATHS.GLOBAL_TEARDOWN_PATH),
  reporter: [
    ["line"],
    ["html", { open: "never", outputFolder: PATHS.HTML_REPORTS_DIR }],
    ["json", { outputFile: PATHS.JSON_REPORTS_FILE }],
    [
      "allure-playwright",
      {
        environmentInfo: {
          "OS Platform": os.platform(),
          "OS Release": os.release(),
          "OS Version": os.version(),
          "Node Version": process.version,
          Hostname: os.hostname(),
          "CI Execution?": process.env.CI ? "Yes" : "No",
          Language: "TypeScript",
          Framework: "Playwright",
          Flavor: "Vanilla",
          Suite: "Template",
          Application: Environment.APPLICATION,
          Environment: Environment.APPLICATION_ENVIRONMENT,
          Instance: Environment.BASE_URL,
          "Date and Time": DateTimeUtils.getDateTime().datetime,
          Shards: Environment.SHARD_TOTAL,
        },
        resultsDir: PATHS.ALLURE_RESULTS_DIR,
        details: true,
      },
    ],
    [path.resolve(__dirname, PATHS.ALLURE_CLEANUP_REPORTER_PATH)],
  ],
  outputDir: PATHS.PLAYWRIGHT_REPORTS_DIR,
  use: {
    testIdAttribute: "data-qa",
    ignoreHTTPSErrors: true,
    actionTimeout: 5 * SECOND_IN_MILISSECONDS,
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "retain-on-failure",
    launchOptions: globalLaunchOptions,
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: Environment.VIEWPORT,
        deviceScaleFactor: undefined,
        launchOptions: {
          ...globalLaunchOptions,
          args: ["--start-maximized"],
        },
      },
    },
  ],
});
