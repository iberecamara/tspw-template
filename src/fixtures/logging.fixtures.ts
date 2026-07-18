import { Environment } from "@configs/environment.config";
import { NEWLINE } from "@data/constants/constants";
import { test as base, TestInfo } from "@playwright/test";
import { TestAutomationLogger } from "@utils/logger.utils";
import { StringUtils } from "@utils/string.utils";

type LoggingFixtures = {
  logger: TestAutomationLogger;
  autologger: void;
  logError: void;
};

export const test = base.extend<LoggingFixtures>({
  logger: async ({}, use, testInfo) => {
    const log = TestAutomationLogger.getInstance(
      testInfo.workerIndex.toString(),
    );
    await use(log);
  },
  autologger: [
    async ({ logger }, use, testInfo: TestInfo) => {
      logger.info("*".repeat(Environment.LOG_LINE_LENGTH));
      logger.info(NEWLINE);
      logger.info(`Starting test: ${testInfo.title}`);
      logger.info(
        `Test tags: ${testInfo.tags.length > 0 ? testInfo.tags.join(", ") : "none"}`,
      );
      if (testInfo.annotations.length > 0) {
        logger.info(
          `Test annotations: ${StringUtils.prettyJson(testInfo.annotations, { sameline: true })}`,
        );
      }
      await use();
      logger.info(`Test finished: ${testInfo.title}`);
      logger.info(NEWLINE);
      logger.info("*".repeat(Environment.LOG_LINE_LENGTH));
    },
    {
      auto: true,
    },
  ],
  logError: [
    async ({}, use) => {
      await use();
      if (test.info().errors.length > 0) {
        const logger = TestAutomationLogger.getInstance();
        for (const error of test.info().errors) {
          if (error.message) {
            logger.error(`${error.message}${NEWLINE.repeat(2)}`);
          }
        }
      }
    },
    {
      auto: true,
    },
  ],
});
