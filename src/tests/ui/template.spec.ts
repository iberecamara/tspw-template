import { test } from "@fixtures/fixtures";

test.describe(
  "Template validations - UI",
  {
    tag: ["@template", "@ui"],
  },
  () => {
    test(
      "Template test",
      { tag: ["@TEMPLATE-0000", "@TC-UI-0000"] },
      async ({ templateSteps }) => {},
    );
  },
);
