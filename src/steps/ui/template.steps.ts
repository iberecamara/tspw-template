import { TemplatePage } from "@pages/template.page";
import { BaseSteps } from "@steps/base.steps";

export class TemplateSteps extends BaseSteps {
  readonly templatePage: TemplatePage;

  constructor(templatePage: TemplatePage) {
    super();
    this.templatePage = templatePage;
  }
}
