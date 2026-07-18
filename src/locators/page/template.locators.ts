import { Page } from "@playwright/test";

export class TemplateLocators {

  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }
}
