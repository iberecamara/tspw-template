import { test as apis } from "@fixtures/api.fixtures";
import { test as logging } from "@fixtures/logging.fixtures";
import { test as pages } from "@fixtures/pages.fixtures";
import { TemplateApiSteps } from "@steps/api/template.steps";
import { TemplateSteps } from "@steps/ui/template.steps";
import { mergeTests } from "playwright/test";

type StepsFixtures = {
  // API
  templateApiSteps: TemplateApiSteps;

  // UI
  templateSteps: TemplateSteps;
};

const merged = mergeTests(apis, pages, logging);

export const test = merged.extend<StepsFixtures>({
  // API
  templateApiSteps: async ({ templateApi }, use) => {
    await use(new TemplateApiSteps(templateApi));
  },

  // UI
  templateSteps: async ({ templatePage }, use) => {
    await use(new TemplateSteps(templatePage));
  },
});
