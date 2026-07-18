import { Reporter } from "@playwright/test/reporter";
import { AllureUtils } from "@utils/allure.utils";

class AllureCleanupReporter implements Reporter {
  onEnd() {
    AllureUtils.allureRemoveResults();
  }
}
export default AllureCleanupReporter;
