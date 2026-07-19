import { TemplateApi } from "@api/template.api";
import { BaseSteps } from "@steps/base.steps";

export class TemplateApiSteps extends BaseSteps {
  readonly templateApi: TemplateApi;

  constructor(templateApi: TemplateApi) {
    super();
    this.templateApi = templateApi;
  }
}
