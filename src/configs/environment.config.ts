import { config } from "dotenv";
import Joi from "joi";

// Defaults APPLICATION_ENVIRONMENT to dev for .env file processing
if (!process.env.APPLICATION_ENVIRONMENT) {
  process.env.APPLICATION_ENVIRONMENT = "dev";
}
config({
  path: [".env", `.env.${process.env.APPLICATION_ENVIRONMENT}`],
  quiet: true,
  override: true,
});

const VALID_ALLURE_STATUSES = [
  "passed",
  "failed",
  "broken",
  "skipped",
  "unknown",
];

interface EnvVars {
  // Playwright variables
  WORKERS: number;
  RETRIES: number;
  HEADLESS: boolean;
  SLOWMO: number;
  VIEWPORT_HEIGHT: number | null;
  VIEWPORT_WIDTH: number | null;

  // Application variables
  APPLICATION: string;
  APPLICATION_ENVIRONMENT?: "local" | "dev" | "qa" | "stg" | "uat" | "prd";
  BASE_URL: string;

  // Sharding variables
  SHARD_INDEX: string;
  SHARD_TOTAL: string;

  // Logger variables
  LOG_CONSOLE: boolean;
  LOG_TYPE: "text" | "json";
  LOG_LEVEL: "info" | "debug" | "warn" | "error" | "trace";
  LOG_TIMESTAMP_FORMAT: string;
  LOG_LINE_LENGTH: number;

  // Miscellanea
  JIRA_BOARD?: string;
  ALLURE_REPORT_REMOVE_STATUS?: string[];
}

const variables = {
  // Playwright variables
  WORKERS: Joi.number().integer().positive().empty("").default(1),
  RETRIES: Joi.number().integer().positive().empty("").default(0),
  HEADLESS: Joi.boolean().empty("").default(true),
  SLOWMO: Joi.number().integer().positive().empty("").default(0),
  VIEWPORT_HEIGHT: Joi.number().integer().positive().empty("").default(null),
  VIEWPORT_WIDTH: Joi.number().integer().positive().empty("").default(null),

  // Application variables
  APPLICATION: Joi.string().required(),
  APPLICATION_ENVIRONMENT: Joi.string()
    .empty("")
    .valid("local", "dev", "qa", "stg", "uat", "prd"),
  BASE_URL: Joi.string().uri().required(),

  // Sharding variables (set by CI when the suite is split across Playwright shards)
  SHARD_INDEX: Joi.string().allow("").empty("").default(""),
  SHARD_TOTAL: Joi.string().allow("").empty("").default(""),

  // Logger variables
  LOG_CONSOLE: Joi.boolean().empty("").default(false),
  LOG_TYPE: Joi.string().empty("").valid("text", "json").default("text"),
  LOG_LEVEL: Joi.string()
    .empty("")
    .valid("info", "debug", "warn", "error", "trace")
    .default("info"),
  LOG_TIMESTAMP_FORMAT: Joi.string().empty("").default("YYYY-MM-DD HH:mm:ss"),
  LOG_LINE_LENGTH: Joi.number().integer().positive().empty("").default(100),

  // Miscellanea
  JIRA_BOARD: Joi.string().allow(""),
  ALLURE_REPORT_REMOVE_STATUS: (Joi.array()
    .items(Joi.string())
    .custom((value: unknown, helpers) => {
      // Se vier do process.env como string, transformamos em array antes de validar
      const stringValue = typeof value === 'string' ? value : '';
      if (!stringValue) return [];

      const statuses = stringValue.split(',').map((item: string) => item.trim());

      for (const status of statuses) {
        const { error } = Joi.string().valid(...VALID_ALLURE_STATUSES).validate(status);
        if (error) {
          return helpers.error('any.invalid', {
            message: `'VALID_ALLURE_STATUSES' contém o valor inválido: '${status}'.`
          });
        }
      }
      return statuses;
    }) as unknown as Joi.ArraySchema),
};

const validationResult: Joi.ValidationResult = Joi.object<EnvVars, true>(
  variables,
)
  .unknown(true)
  .validate(process.env, {
    allowUnknown: true,
    abortEarly: false,
  });

if (validationResult.error) {
  throw new Error(
    `Environment variables validation error: ${validationResult.error.message}`,
  );
}

const envValues = validationResult.value as EnvVars;

type Viewport = {
  height: number;
  width: number;
};

export class Environment {
  static readonly WORKERS: number = envValues.WORKERS;
  static readonly RETRIES: number = envValues.RETRIES;
  static readonly HEADLESS: boolean = envValues.HEADLESS;
  static readonly SLOWMO: number = envValues.SLOWMO;
  static readonly VIEWPORT: Viewport | null =
    envValues.VIEWPORT_HEIGHT && envValues.VIEWPORT_WIDTH
      ? {
        height: envValues.VIEWPORT_HEIGHT,
        width: envValues.VIEWPORT_WIDTH,
      }
      : null;

  static readonly APPLICATION: string = envValues.APPLICATION;
  static readonly APPLICATION_ENVIRONMENT: string =
    envValues.APPLICATION_ENVIRONMENT ?? "dev";

  static readonly SHARD_INDEX: string = envValues.SHARD_INDEX;
  static readonly SHARD_TOTAL: string = envValues.SHARD_TOTAL;

  static readonly BASE_URL: string = envValues.BASE_URL;
  static readonly BASE_API_URL: string = `${Environment.BASE_URL}/api`;

  static readonly LOG_CONSOLE: boolean = envValues.LOG_CONSOLE;
  static readonly LOG_TYPE: string = envValues.LOG_TYPE;
  static readonly LOG_LEVEL: string = envValues.LOG_LEVEL;
  static readonly LOG_TIMESTAMP_FORMAT: string = envValues.LOG_TIMESTAMP_FORMAT;
  static readonly LOG_LINE_LENGTH: number = envValues.LOG_LINE_LENGTH;

  static readonly JIRA_BOARD: string = envValues.JIRA_BOARD ?? "";
  static readonly PROJECT_TAG: string = `@${Environment.JIRA_BOARD}`;
  static readonly SET_JIRA_TAG: (id: number) => string = (
    id: number,
  ): string => {
    return `${Environment.PROJECT_TAG}-${id}`;
  };

  static readonly ALLURE_REPORT_REMOVE_STATUS: string[] =
    envValues.ALLURE_REPORT_REMOVE_STATUS ?? [];
}
