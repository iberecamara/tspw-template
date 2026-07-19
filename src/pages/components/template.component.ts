import { TemplateComponentLocators } from "@locators/component/template.locators";
import { BasePage } from "@pages.base/base.page";
import { Page } from "@playwright/test";

export class TemplateComponent extends BasePage {
  readonly locators: TemplateComponentLocators;

  constructor(page: Page) {
    super(page);
    this.locators = new TemplateComponentLocators(page);
  }
}
