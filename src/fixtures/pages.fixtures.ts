import { TemplatePage } from "@pages/template.page";
import { test as base, Page } from "@playwright/test";

type PageConstructor<PageClass> = new (page: Page) => PageClass;

function createPageFixture<PageClass>(
  pageConstructor: PageConstructor<PageClass>,
) {
  return async (
    { page }: { page: Page },
    use: (value: PageClass) => Promise<void>,
  ) => {
    await use(new pageConstructor(page));
  };
}

type PageFixtures = {
  adblocker: void;
  templatePage: TemplatePage;
};

export const test = base.extend<PageFixtures>({
  adblocker: [
    async ({ page }, use) => {
      await page.route("**/*", async (route) => {
        if (route.request().url().startsWith("https://googleads.")) {
          await route.abort();
        } else {
          await route.continue();
        }
      });
      await use();
    },
    { auto: true },
  ],
  templatePage: createPageFixture(TemplatePage),
});
