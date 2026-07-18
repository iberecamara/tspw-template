import { TestAutomationLogger } from "@utils/logger.utils";

export class BaseSteps {
  readonly logger: TestAutomationLogger;

  constructor() {
    this.logger = TestAutomationLogger.getInstance();
  }
}
