# TSPW Template — Vanilla TypeScript Playwright Test Automation Framework

A ready-to-use starting point for building UI and API test automation with [Playwright](https://playwright.dev/) and TypeScript. "Vanilla" means there's no BDD wrapper (no Cucumber/Gherkin) — you write tests using Playwright's native test runner, fixtures, and a layered Page Object Model.

This repository is a **template**: it ships with one placeholder feature ("Template") wired end-to-end through every layer of the framework, so you can see how the pieces connect and copy the pattern for your own application.

See [TSPW Automation Exercise](https://github.com/iberecamara/tspw-automation-exercise) for an example of this template implemented.

If you're new to test automation or new to this codebase, read this document top to bottom before writing your first test — it explains not just *how* to run things, but *where* new code is supposed to go.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Cloning the Project](#cloning-the-project)
- [Installing Dependencies](#installing-dependencies)
- [Environment Configuration (.env)](#environment-configuration-env)
- [Project Structure](#project-structure)
  - [Architecture Overview](#architecture-overview)
  - [Layers Explained](#layers-explained)
  - [Path Aliases](#path-aliases)
- [Running the Tests](#running-the-tests)
- [Reports and Logs](#reports-and-logs)
- [Linting and Formatting](#linting-and-formatting)
- [Extending the Project](#extending-the-project)
  - [1. Add a data model](#1-add-a-data-model)
  - [2. Add locators](#2-add-locators)
  - [3. Add a Page Object (or Component)](#3-add-a-page-object-or-component)
  - [4. Add UI Steps](#4-add-ui-steps)
  - [5. Wire the new Page/Steps into fixtures](#5-wire-the-new-pagesteps-into-fixtures)
  - [6. Write the test](#6-write-the-test)
  - [7. Adding an API client and API Steps](#7-adding-an-api-client-and-api-steps)
- [CI/CD (GitHub Actions)](#cicd-github-actions)
- [License](#license)

---

## Prerequisites

Before you start, make sure you have:

- **Node.js 20 LTS or newer** installed (CI runs on Node 24). Check with:
  ```bash
  node -v
  ```
- **Git** installed.
- A code editor with TypeScript/ESLint support (VS Code is recommended).

You do **not** need Playwright browsers installed manually — a script below installs them for you.

---

## Cloning the Project

```bash
git clone <this-repository-url>
cd tspw-template
```

If you're using this repo as a **template** to start a brand-new project, either:
- Use GitHub's "Use this template" button when creating your new repository, or
- Clone it and re-point the `origin` remote to your own new repository:
  ```bash
  git remote set-url origin <your-new-repository-url>
  ```

---

## Installing Dependencies

Install the Node dependencies:

```bash
npm install
```

Then install the Playwright browsers (this only needs to be done once, and again whenever Playwright is updated):

```bash
npx playwright install
```

> On Linux, if you hit missing OS-level dependencies, run `npx playwright install --with-deps` instead.

---

## Environment Configuration (.env)

The framework reads its configuration from environment variables, loaded from a `.env` file at the project root using [dotenv](https://www.npmjs.com/package/dotenv) and validated with [Joi](https://joi.dev/) (`src/configs/environment.config.ts`). **If a required variable is missing or invalid, the framework throws an error on startup** — this is intentional, so misconfiguration is caught immediately instead of silently breaking tests later.

### Setting it up

Create a `.env` file at the project root (it's git-ignored, so it's local to your machine — this is where secrets/environment-specific values live):

```dotenv
BASE_URL=https://www.template.com
WORKERS=2
APPLICATION=Template
LOG_CONSOLE=true
LOG_TYPE=
LOG_LEVEL=debug
LOG_TIMESTAMP_FORMAT=
LOG_LINE_LENGTH=
HEADLESS=
SLOWMO=
JIRA_BOARD=TEMPLATE
ALLURE_REPORT_REMOVE_STATUS=
RETRIES=
```

Leaving a value blank tells the framework to fall back to its built-in default (see the table below) — you don't need to fill in every line.

You can also create environment-specific files, e.g. `.env.qa`, `.env.uat`. The framework picks the right one based on the `APPLICATION_ENVIRONMENT` variable (`local`, `dev`, `qa`, `stg`, `uat`, `prd`) — if unset, it defaults to `dev`.

### Variable reference

| Variable | Required? | Default | Description |
|---|---|---|---|
| `BASE_URL` | ✅ Yes | — | Base URL of the application under test. |
| `APPLICATION` | ✅ Yes | — | Application/suite name, shown in the Allure report. |
| `APPLICATION_ENVIRONMENT` | No | `dev` | One of `local`, `dev`, `qa`, `stg`, `uat`, `prd`. Selects which `.env.<name>` file is also loaded. |
| `WORKERS` | No | `1` | Number of parallel Playwright workers. |
| `RETRIES` | No | `0` | Number of automatic retries for a failed test. |
| `HEADLESS` | No | `true` | Whether browsers run headless. |
| `SLOWMO` | No | `0` | Milliseconds of delay added between Playwright actions (useful for debugging). |
| `VIEWPORT_HEIGHT` / `VIEWPORT_WIDTH` | No | `null` (Playwright's own default) | Custom browser viewport size, in pixels. Both must be set together. |
| `LOG_CONSOLE` | No | `false` | Whether logs are also printed to the console (in addition to the log file). |
| `LOG_TYPE` | No | `text` | `text` or `json` log output format. |
| `LOG_LEVEL` | No | `info` | One of `info`, `debug`, `warn`, `error`, `trace`. |
| `LOG_TIMESTAMP_FORMAT` | No | `YYYY-MM-DD HH:mm:ss` | Timestamp format used in log lines. |
| `LOG_LINE_LENGTH` | No | `100` | Width of the `****`/`####` separator lines in log output. |
| `JIRA_BOARD` | No | `''` | Prefix used to build Jira tags (e.g. `SET_JIRA_TAG(15)` → `@TEMPLATE-15`). |
| `ALLURE_REPORT_REMOVE_STATUS` | No | `[]` | Comma-separated list of Allure result statuses to strip from the report before publishing, e.g. `passed,skipped`. Valid values: `passed`, `failed`, `broken`, `skipped`, `unknown`. |
| `SHARD_INDEX` / `SHARD_TOTAL` | No | `''` | Set automatically by CI when splitting the suite across shards — you generally won't set these locally. |

---

## Project Structure

```
src/
├── api/                    # API clients — raw HTTP calls to your app's API
├── configs/                # Playwright config, .env parsing (environment.config.ts), path constants, eslint config
├── data/
│   ├── constants/            # Magic strings/numbers
│   ├── model/                  # TypeScript interfaces/types for your domain data
│   └── types/                   # API response shapes and other misc types
├── database/                # Placeholder for DB helpers, if your suite needs direct DB access/seeding
├── exceptions/              # Custom error types
├── files/
│   ├── upload/                 # Static files used in upload tests
│   └── download/                # Filepath helpers for verifying downloaded files
├── fixtures/                 # Playwright fixture composition (api, pages, steps, logging)
├── global/                   # Global teardown hook
├── locators/
│   ├── page/                   # Raw Locator definitions, one file per full page
│   └── component/                # Raw Locator definitions, one file per reusable UI fragment
├── pages/
│   ├── base.page.ts            # Base class every Page Object / Component extends
│   ├── pages/                    # Page Object classes — one per application page
│   └── components/                # Reusable partial-page objects (e.g. header, nav bar)
├── reporters/                # Custom Playwright reporters
├── steps/
│   ├── ui/                      # Business-readable UI "step" wrappers around Page Object actions
│   └── api/                      # Business-readable API "step" wrappers around API clients
├── tests/
│   ├── ui/                      # UI spec files
│   ├── api/                      # API-only spec files
│   └── dev/                      # Local scratch/playground tests — git-ignored, never committed
└── utils/                    # Cross-cutting utilities (logger, datetime, allure, files, strings…)
```

### Architecture Overview

The framework follows a **layered Page Object Model**. Each layer has one job, and a test only ever talks to the *Steps* layer — never directly to a Page Object, Locator, or API client:

```
tests/ui/*.spec.ts  or  tests/api/*.spec.ts
        │  calls
        ▼
steps/ui/*.steps.ts   (or steps/api/*.steps.ts)   ← business-readable actions & assertions
        │  calls
        ▼
pages/pages/*.page.ts   (or api/*.api.ts)          ← page-level actions / raw HTTP calls
        │  composes / uses
        ▼
locators/page/*.locators.ts   (or pages/components/*.component.ts + locators/component/*)
```

This means:
- **Tests** stay short and read like a checklist of business actions.
- **Steps** classes contain the actual Playwright interactions, `test.step()` wrapping, logging, and assertions (`validate*` methods).
- **Page Objects** know *where things are* and expose simple actions (click, fill, navigate) — no assertions here.
- **Locators** are pure — just a list of `Locator` definitions, nothing else.

### Layers Explained

| Layer | Folder | Responsibility |
|---|---|---|
| Tests | `src/tests/` | Orchestrate a scenario by calling Steps methods, using fixtures for setup/teardown. No direct assertions or Playwright calls here. |
| Steps | `src/steps/` | The only layer allowed to make assertions (via `validate*` methods — see below). Wraps Page Object / API calls in readable, logged, `test.step()`-labeled actions. |
| Pages / Components | `src/pages/` | Encapsulate interactions with a page or a reusable UI fragment (e.g. a header). No assertions. |
| Locators | `src/locators/` | Just `Locator` definitions — no logic. |
| API | `src/api/` | Raw HTTP calls to your application's API, using Playwright's `APIRequestContext`. |
| Fixtures | `src/fixtures/` | Wires everything above into Playwright's dependency-injected `test` object (see below). |
| Data | `src/data/` | Domain models/types, constants, and API response shapes — shared across all layers. |
| Utils | `src/utils/` | Logger, date/string/number/array helpers, Allure report utilities — cross-cutting, no test-specific logic. |

**Assertions convention:** every assertion lives in a Steps method whose name starts with `validate` (e.g. `validateTitle`, `validateOrderPlaced`). This is enforced by an ESLint rule (`playwright/expect-expect`) that recognizes `validate*` methods as containing assertions — tests calling only `validate*` methods (and no other explicit `expect()`) will not be flagged as "test has no assertions."

### Path Aliases

The project uses TypeScript path aliases (configured in `tsconfig.json`) so imports don't turn into long relative paths like `../../../pages/pages/template.page`. Use these instead:

| Alias | Resolves to |
|---|---|
| `@api/*` | `src/api/*` |
| `@components/*` | `src/pages/components/*` |
| `@configs/*` | `src/configs/*` |
| `@data/*` | `src/data/*` |
| `@exceptions/*` | `src/exceptions/*` |
| `@files/*` | `src/files/*` |
| `@fixtures/*` | `src/fixtures/*` |
| `@locators/*` | `src/locators/*` |
| `@pages/*` | `src/pages/pages/*` |
| `@pages.base/*` | `src/pages/*` (i.e. `base.page.ts`) |
| `@steps/*` | `src/steps/*` |
| `@utils/*` | `src/utils/*` |

---

## Running the Tests

All test commands go through `npm test` (or a variant of it), which runs Playwright with the project's config file (`src/configs/playwright.config.ts`).

| Command | What it does |
|---|---|
| `npm test` | Runs the full suite, **excluding** anything tagged `@dev`. This is the standard command. |
| `npm run test:ui` | Runs only tests tagged `@ui`. |
| `npm run test:api` | Runs only tests tagged `@api`. |
| `npm run test:dev` | Runs only tests tagged `@dev` (local scratch tests in `src/tests/dev/`, git-ignored). |
| `npm run test:pwui` | Opens Playwright's interactive UI Mode for the full suite. |
| `npm run test:pwui:ui` | Opens UI Mode, filtered to `@ui`-tagged tests. |
| `npm run test:pwui:api` | Opens UI Mode, filtered to `@api`-tagged tests. |
| `npm run test:retry-failed` | Re-runs only the tests that failed in the previous run. |

### Running a specific test or file

Playwright CLI flags pass straight through `npm test --`, e.g.:

```bash
# Run a single spec file
npm test -- src/tests/ui/template.spec.ts

# Run tests matching a name
npm test -- -g "Template test"

# Run tests matching a specific tag (e.g. a Jira ticket tag)
npm test -- --grep @TEMPLATE-0000
```

### Debugging

```bash
# Step through a test with Playwright's Inspector
npm test -- --debug src/tests/ui/template.spec.ts

# Open UI Mode (recommended for day-to-day debugging)
npm run test:pwui
```

---

## Reports and Logs

Test artifacts are written to `artifacts/` (git-ignored) at the project root:

- `artifacts/reports/html/` — Playwright's built-in HTML report
- `artifacts/reports/json/` — raw JSON results
- `artifacts/reports/allure/` — Allure results/report
- `artifacts/logs/` — Winston log files, one per worker/shard, organized by environment and date

| Command | What it does |
|---|---|
| `npm run report:html:open` | Opens the last Playwright HTML report. |
| `npm run report:allure:generate` | Generates a full Allure HTML report from the latest results. |
| `npm run report:allure:open` | Opens the last generated Allure report in your browser. |
| `npm run report:allure:export` | Generates a single-file, portable Allure report (used by CI for GitHub Pages). |
| `npm run report` | Generates **and** opens the Allure report in one step. |
| `npm run clean:logs` | Deletes all files under `artifacts/logs/`. |
| `npm run clean:reports` | Deletes all files under `artifacts/reports/`. |
| `npm run clean` | Runs both of the above. |

> A custom reporter (`allure-cleanup.reporter.ts`) automatically strips Allure results matching `ALLURE_REPORT_REMOVE_STATUS` (see [Environment Configuration](#environment-configuration-env)) at the end of every run — useful for keeping the published report focused on failures, for example.

---

## Linting and Formatting

The project uses ESLint (with `typescript-eslint` and `eslint-plugin-playwright`) and Prettier.

| Command | What it does |
|---|---|
| `npm run lint` | Lints `src/` for errors. |
| `npm run lint:fix` | Lints and auto-fixes what it safely can. |
| `npm run format:check` | Checks that `src/**/*.ts` is Prettier-formatted, without changing anything. |
| `npm run format:write` | Formats `src/**/*.ts` with Prettier. |
| `npm run lint:formatcheck` | Runs both `lint` and `format:check` back to back. |

Run `npm run lint:fix && npm run format:write` before committing to catch most issues locally, ahead of CI.

---

## Extending the Project

This template ships with one fully-wired placeholder feature (everything named `Template*`) so you can see the whole path from a test down to a locator. To add a **new** page/feature to the suite, follow these steps in order — using the existing `Template*` files as your working example.

### 1. Add a data model

If your feature works with structured data (e.g. a user, a product), define its shape in `src/data/model/`:

```typescript
// src/data/model/my-feature.model.ts
export interface MyFeatureType {
  id: number;
  name: string;
}
```

### 2. Add locators

Create a locators file under `src/locators/page/` (or `src/locators/component/` for a reusable fragment). Locators are the *only* place `page.locator(...)`/`page.getByRole(...)` etc. should be called:

```typescript
// src/locators/page/my-feature.locators.ts
import { Page } from '@playwright/test';

export class MyFeatureLocators {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
        // Example: this.submitButton = page.getByRole('button', { name: 'Submit' });
    }
}
```

### 3. Add a Page Object (or Component)

Create the Page Object under `src/pages/pages/` (use `src/pages/components/` instead if it's a reusable fragment like a header/nav that appears on multiple pages). It extends `BasePage`, which gives you shared helpers (`click`, `fill`, `checkbox`, `hover`, `scroll`, `goToHome`, ...):

```typescript
// src/pages/pages/my-feature.page.ts
import { MyFeatureLocators } from '@locators/page/my-feature.locators';
import { BasePage } from '@pages.base/base.page';
import { Page } from '@playwright/test';

export class MyFeaturePage extends BasePage {
    readonly locators: MyFeatureLocators;

    constructor(page: Page) {
        super(page);
        this.locators = new MyFeatureLocators(page);
    }

    // Page-level actions go here, e.g.:
    // async submitForm(): Promise<void> {
    //     await this.click(this.locators.submitButton);
    // }
}
```

### 4. Add UI Steps

Create the Steps class under `src/steps/ui/`. This is where `test.step()` wrapping, logging, and — importantly — **assertions** (`validate*` methods) live:

```typescript
// src/steps/ui/my-feature.steps.ts
import { MyFeaturePage } from '@pages/my-feature.page';
import { BaseSteps } from '@steps/base.steps';
import { expect, test } from '@playwright/test';

export class MyFeatureSteps extends BaseSteps {
    readonly myFeaturePage: MyFeaturePage;

    constructor(myFeaturePage: MyFeaturePage) {
        super();
        this.myFeaturePage = myFeaturePage;
    }

    async doSomething(): Promise<void> {
        await test.step('Do something on My Feature page', async () => {
            this.logger.info('Doing something on My Feature page');
            // await this.myFeaturePage.submitForm();
        });
    }

    async validateSomething(expected: string): Promise<void> {
        await test.step('Validate something on My Feature page', async () => {
            // await expect(this.myFeaturePage.locators.someText).toHaveText(expected);
        });
    }
}
```

### 5. Wire the new Page/Steps into fixtures

Register the Page Object in `src/fixtures/pages.fixtures.ts`:

```typescript
myFeaturePage: createPageFixture(MyFeaturePage),
```

Then register the Steps class in `src/fixtures/steps.fixtures.ts`:

```typescript
myFeatureSteps: async ({ myFeaturePage }, use) => {
    await use(new MyFeatureSteps(myFeaturePage));
},
```

Don't forget to add both to their respective `*Fixtures` type definitions in those files, and import the new classes at the top.

### 6. Write the test

Create the spec file under `src/tests/ui/`. Tests should read as a sequence of Steps calls — no direct Playwright/assertion calls here:

```typescript
// src/tests/ui/my-feature.spec.ts
import { test } from '@fixtures/fixtures';

test.describe('My Feature validations - UI', { tag: ['@my-feature', '@ui'] }, () => {
    test(
        'Doing something works as expected',
        { tag: ['@PROJ-1234', '@TC-UI-100'] },
        async ({ myFeatureSteps }) => {
            await myFeatureSteps.doSomething();
            await myFeatureSteps.validateSomething('expected value');
        },
    );
});
```

### 7. Adding an API client and API Steps

The same pattern applies to API tests, just one layer shorter (no locators/Page Object):

1. **API client** — add to `src/api/`, extending `APIRequestContext` usage like `template.api.ts`.
2. **API Steps** — add to `src/steps/api/`, extending `BaseSteps`, following `template.steps.ts` (API version).
3. **Fixtures** — register the API client in `src/fixtures/api.fixtures.ts`, then the API Steps class in `src/fixtures/steps.fixtures.ts`.
4. **Test** — add the spec under `src/tests/api/`.

---

## CI/CD (GitHub Actions)

The workflow at `.github/workflows/playwright.yml` runs automatically on every push and pull request to `main`, and can also be triggered manually (`workflow_dispatch`). It has three jobs:

1. **`test`** — runs the suite across **4 parallel shards** (using Playwright's `--shard` flag), each on its own GitHub-hosted runner. Playwright browsers are cached between runs to speed things up. Each shard uploads its raw Allure results and log files as build artifacts, even if that shard's tests failed (`continue-on-error: true` lets other shards keep running, then the job is explicitly failed afterward if any shard had test failures).
2. **`merge-reports`** — downloads and merges the Allure results from all 4 shards, generates a single combined report, and uploads it as a downloadable artifact and as a GitHub Pages build artifact.
3. **`deploy`** — publishes the merged Allure report to **GitHub Pages**, but only when the workflow was triggered by a `push` to `main` (not on pull requests).

### CI environment variables

The workflow sets these directly in the `env:` block of the workflow file (not from `.env`, since CI has no access to your local file): `APPLICATION`, `WORKERS`, `RETRIES`, `LOG_LINE_LENGTH`, `LOG_CONSOLE`, `LOG_LEVEL`, `HEADLESS`, `JIRA_BOARD`, plus `SHARD_INDEX`/`SHARD_TOTAL` per shard.

`BASE_URL` is required by `environment.config.ts`, and is wired up as `${{ vars.BASE_URL }}` — a **repository (or environment) variable**, not a hardcoded value, since it changes per application. Set it under **Settings → Secrets and variables → Actions → Variables** (use a Secret instead if the URL itself is sensitive) before the workflow will pass.

### Enabling GitHub Pages for the report

For the `deploy` job to work in your own fork/repo, enable GitHub Pages once, under **Settings → Pages → Build and deployment → Source: GitHub Actions**.

### Running shards locally

You can simulate a single CI shard locally with:

```bash
npm test -- --shard=1/4
```

---

## License

Distributed under the ISC License — see [`LICENSE`](./LICENSE) for details.