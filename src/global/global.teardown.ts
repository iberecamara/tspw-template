import { TestAutomationLogger } from "@utils/logger.utils";

async function globalTeardown() {
  await TestAutomationLogger.splitGeneratedLogs();
}

export default globalTeardown;
