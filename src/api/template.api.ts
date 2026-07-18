import { APIRequestContext } from "@playwright/test";

export class TemplateApi {
  readonly request: APIRequestContext;

  constructor(request: APIRequestContext) {
    this.request = request;
  }

}
