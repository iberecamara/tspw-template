import { TemplateLocators } from "@locators/page/template.locators";
import { BasePage } from "@pages.base/base.page";
import { Page } from "@playwright/test";

export class TemplatePage extends BasePage {
  readonly locators: TemplateLocators;

  constructor(page: Page) {
    super(page);
    this.locators = new TemplateLocators(page);
  }
}
