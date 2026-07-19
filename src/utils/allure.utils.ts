import { Environment } from "@configs/environment.config";
import {
  ALLURE_REPORT_DIR,
  ALLURE_REPORT_SINGLE_FILE_DIR,
  ALLURE_RESULTS_DIR,
} from "@configs/paths";
import { EMPTY, NEWLINE } from "@data/constants/constants";
import type { Attachment, TestResult } from "allure-js-commons";
import * as fs from "fs";
import { execSync } from "node:child_process";
import * as path from "path";

export class AllureUtils {
  static allureRemoveResults(): void {
    const resultsDir = ALLURE_RESULTS_DIR;
    if (!fs.existsSync(resultsDir)) {
      console.info("No allure-results directory found. Skipping cleanup.");
      return;
    }

    const files = fs.readdirSync(resultsDir);

    files.forEach((file) => {
      if (file.endsWith("-result.json")) {
        const filePath = path.join(resultsDir, file);
        try {
          const fileContent = fs.readFileSync(filePath, "utf8");
          const testResult: TestResult = JSON.parse(fileContent) as TestResult;
          if (
            Environment.ALLURE_REPORT_REMOVE_STATUS &&
            Environment.ALLURE_REPORT_REMOVE_STATUS.includes(
              testResult.status ?? EMPTY,
            )
          ) {
            fs.unlinkSync(filePath);
            if (testResult.attachments) {
              testResult.attachments.forEach((attachment: Attachment) => {
                const attachmentPath = path.join(resultsDir, attachment.source);
                if (fs.existsSync(attachmentPath)) {
                  fs.unlinkSync(attachmentPath);
                }
              });
            }
          }
        } catch (error) {
          console.error(`Failed to process '${file}'`, error);
        }
      }
    });

    if (Environment.ALLURE_REPORT_REMOVE_STATUS && Environment.ALLURE_REPORT_REMOVE_STATUS.length > 0) {
      console.info(
        `Allure Results Cleanup complete, status results removed: '${Environment.ALLURE_REPORT_REMOVE_STATUS.join(", ")}'.`,
      );
    } else {
      console.info("Allure Results Cleanup will not be executed.");
    }
  }

  private static run(cmd: string): void {
    execSync(cmd, { stdio: "inherit" });
  }

  static generate(): void {
    this.run(
      `npx allure generate '${ALLURE_RESULTS_DIR}' -o '${ALLURE_REPORT_DIR}'`,
    );
  }

  static open(): void {
    this.run(`npx allure open '${ALLURE_REPORT_DIR}'`);
  }

  static exportSingleFile(): void {
    this.run(
      `npx allure awesome generate '${ALLURE_RESULTS_DIR}' -o '${ALLURE_REPORT_SINGLE_FILE_DIR}' --single-file`,
    );
  }

  static all(): void {
    this.generate();
    this.open();
  }
}

if (require.main === module) {
  type Command = "generate" | "open" | "export" | "all";
  const command = process.argv[2] as Command | undefined;

  switch (command) {
    case "generate":
      AllureUtils.generate();
      break;
    case "open":
      AllureUtils.open();
      break;
    case "export":
      AllureUtils.exportSingleFile();
      break;
    case "all":
      AllureUtils.all();
      break;
    default:
      console.error(
        `Unknown or missing command: '${String(command) ?? ""}'${NEWLINE}Expected one of: generate | open | export | all`,
      );
  }
}
