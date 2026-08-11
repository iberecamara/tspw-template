import { Page } from "@playwright/test";

export class TemplateComponentLocators {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }
}
