import path from "node:path";

export const ROOT_DIR = path.resolve(__dirname, "..", "..");

export const ARTIFACTS_DIR = path.join(ROOT_DIR, "artifacts");

export const LOGS_DIR = path.join(ARTIFACTS_DIR, "logs");

export const REPORTS_DIR = path.join(ARTIFACTS_DIR, "reports");
export const ALLURE_DIR = path.join(REPORTS_DIR, "allure");
export const HTML_REPORTS_DIR = path.join(REPORTS_DIR, "html");
export const JSON_REPORTS_DIR = path.join(REPORTS_DIR, "json");
export const JSON_REPORTS_FILE = path.join(JSON_REPORTS_DIR, "report.json");
export const PLAYWRIGHT_REPORTS_DIR = path.join(REPORTS_DIR, "playwright");

export const ALLURE_RESULTS_DIR = path.join(ALLURE_DIR, "allure-results");
export const ALLURE_REPORT_DIR = path.join(ALLURE_DIR, "allure-report");
export const ALLURE_REPORT_SINGLE_FILE_DIR = path.join(
  ALLURE_DIR,
  "allure-report-single",
);

export const ALLURE_CLEANUP_REPORTER_PATH = path.join(
  __dirname,
  "..",
  "reporters",
  "allure-cleanup.reporter.ts",
);

export const GLOBAL_TEARDOWN_PATH = path.join(
  __dirname,
  "..",
  "global",
  "global.teardown",
);

export const PATHS = {
  ROOT_DIR,
  ARTIFACTS_DIR,
  LOGS_DIR,
  REPORTS_DIR,
  ALLURE_DIR,
  ALLURE_RESULTS_DIR,
  ALLURE_REPORT_DIR,
  ALLURE_REPORT_SINGLE_FILE_DIR,
  ALLURE_CLEANUP_REPORTER_PATH,
  GLOBAL_TEARDOWN_PATH,
  HTML_REPORTS_DIR,
  JSON_REPORTS_DIR,
  JSON_REPORTS_FILE,
  PLAYWRIGHT_REPORTS_DIR,
} as const;
