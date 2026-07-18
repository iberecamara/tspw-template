import { TemplateApi } from "@api/template.api";
import { APIRequestContext, test as base } from "@playwright/test";

type ApiConstructor<ApiClass> = new (request: APIRequestContext) => ApiClass;

function createApiFixture<ApiClass>(apiConstructor: ApiConstructor<ApiClass>) {
  return async (
    { request }: { request: APIRequestContext },
    use: (value: ApiClass) => Promise<void>,
  ) => {
    const apiInstance = new apiConstructor(request);
    await use(apiInstance);
  };
}

type ApiFixtures = {
  templateApi: TemplateApi;
};

export const test = base.extend<ApiFixtures>({
  templateApi: createApiFixture(TemplateApi),
});
