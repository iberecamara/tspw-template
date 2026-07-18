import { Environment } from "@configs/environment.config";
import { EMPTY } from "@data/constants/constants";
import { DateTimeUtils } from "@utils/datetime.utils";
import * as fs from "fs";
import { TransformableInfo } from "logform";
import * as path from "path";
import winston from "winston";

interface LogInfo extends TransformableInfo {
  timestamp: string;
  message: string;
}

const PRINTF_FORMATTER = winston.format.printf((info) => {
  const { level, message, timestamp } = info as LogInfo;
  return `[${level}] - ${timestamp}: ${message}`;
});

const TIMESTAMP_FORMAT = { format: Environment.LOG_TIMESTAMP_FORMAT };

export const LOG_FOLDER = "./artifacts/logs";

export class TestAutomationLogger {
  private static instance: TestAutomationLogger;
  private readonly winstonLogger: winston.Logger;
  lineLenght: number;
  static dirpath: string = EMPTY;

  private constructor(worker: string) {
    this.lineLenght = Environment.LOG_LINE_LENGTH;
    this.winstonLogger = TestAutomationLogger.startLogger(worker);
  }

  public static getInstance(worker?: string): TestAutomationLogger {
    if (!TestAutomationLogger.instance) {
      if (!worker) {
        throw new Error(
          "Worker name is required to initialize the logger instance.",
        );
      } else {
        TestAutomationLogger.instance = new TestAutomationLogger(worker);
      }
    }
    return TestAutomationLogger.instance;
  }

  private static startLogger(worker: string): winston.Logger {
    const dateTime = DateTimeUtils.getDateTime({ fileFormat: true });
    const transports = [];

    if (Environment.LOG_CONSOLE) {
      transports.push(new winston.transports.Console());
    }
    TestAutomationLogger.dirpath = `${LOG_FOLDER}/${Environment.APPLICATION_ENVIRONMENT}/${dateTime.date}`;
    const shardSuffix = TestAutomationLogger.getShardSuffix();
    transports.push(
      new winston.transports.File({
        filename: `TEMP-test-automation-${worker}${shardSuffix}-${dateTime.datetime}.log`,
        dirname: TestAutomationLogger.dirpath,
      }),
    );

    return winston.createLogger({
      level: Environment.LOG_LEVEL,
      format: TestAutomationLogger.getFormat(),
      transports: transports,
    });
  }

  private static getShardSuffix(): string {
    return Environment.SHARD_INDEX ? `-shard${Environment.SHARD_INDEX}` : EMPTY;
  }

  private static getFormat(): winston.Logform.Format {
    if (Environment.LOG_TYPE === "json") {
      return TestAutomationLogger.jsonFormat();
    } else {
      return TestAutomationLogger.textFormat();
    }
  }

  private static jsonFormat(): winston.Logform.Format {
    return winston.format.combine(
      winston.format.errors({ stack: true }),
      winston.format.json(),
      winston.format.prettyPrint({ depth: 4, colorize: true }),
      winston.format.timestamp(TIMESTAMP_FORMAT),
      winston.format.metadata(),
      PRINTF_FORMATTER,
    );
  }

  private static textFormat(): winston.Logform.Format {
    return winston.format.combine(
      winston.format.colorize(),
      winston.format.errors({ stack: true }),
      winston.format.align(),
      winston.format.timestamp(TIMESTAMP_FORMAT),
      PRINTF_FORMATTER,
      winston.format.metadata(),
    );
  }

  isDebugEnabled(): boolean {
    return (
      this.winstonLogger.levels[this.winstonLogger.level] >=
      this.winstonLogger.levels["debug"]
    );
  }

  info(message: string): void {
    this.winstonLogger.info(message);
  }

  debug(message: string): void {
    this.winstonLogger.debug(message);
  }

  error(message: string): void {
    this.winstonLogger.error(message);
  }

  warn(message: string): void {
    this.winstonLogger.warn(message);
  }

  close(): void {
    this.winstonLogger.close();
  }

  public static async splitGeneratedLogs(): Promise<void> {
    const resolvedSourceDirectory = path.resolve(TestAutomationLogger.dirpath);
    if (!fs.existsSync(resolvedSourceDirectory)) {
      throw new Error(
        `Log directory does not exist: ${resolvedSourceDirectory}`,
      );
    }
    const logFiles = TestAutomationLogger.findLogFiles(resolvedSourceDirectory);
    for (const logFile of logFiles) {
      const content = fs.readFileSync(logFile, "utf8");
      for (const executionContent of TestAutomationLogger.splitIntoExecutionBlocks(
        content,
      )) {
        if (!TestAutomationLogger.isCompleteExecutionBlock(executionContent)) {
          continue;
        }
        const executionTag =
          TestAutomationLogger.extractExecutionTag(executionContent);
        const timestamp = TestAutomationLogger.extractTimestampFromFileName(
          path.basename(logFile),
        );
        const shardSuffix = TestAutomationLogger.getShardSuffix();
        const outputFileName = `${executionTag}-test-automation-${Environment.APPLICATION_ENVIRONMENT}${shardSuffix}-${timestamp}.log`;
        const outputFilePath = path.join(path.dirname(logFile), outputFileName);
        fs.writeFileSync(outputFilePath, executionContent, "utf8");
      }
    }

    await TestAutomationLogger.removeTempFiles();
  }

  private static findLogFiles(directoryPath: string): string[] {
    const entries = fs.readdirSync(directoryPath, { withFileTypes: true });
    const logFiles: string[] = [];
    for (const entry of entries) {
      const entryPath = path.join(directoryPath, entry.name);
      if (entry.isDirectory()) {
        logFiles.push(...TestAutomationLogger.findLogFiles(entryPath));
        continue;
      }
      if (entry.isFile() && TestAutomationLogger.isSourceLogFile(entry.name)) {
        logFiles.push(entryPath);
      }
    }
    return logFiles.sort((left, right) => left.localeCompare(right));
  }

  private static isSourceLogFile(fileName: string): boolean {
    return /^TEMP-test-automation-.*\.log$/i.test(fileName);
  }

  private static splitIntoExecutionBlocks(content: string): string[] {
    const lines = content.split(/\r?\n/);
    const blocks: string[] = [];
    const currentBlock: string[] = [];
    let insideExecution = false;
    for (const line of lines) {
      const marker = TestAutomationLogger.getBoundaryMarker(line);
      if (marker === "*") {
        if (insideExecution) {
          currentBlock.push("#".repeat(Environment.LOG_LINE_LENGTH));
          const blockContent = currentBlock.join("\n").trim();
          if (TestAutomationLogger.isMeaningfulExecutionBlock(blockContent)) {
            blocks.push(blockContent);
          }
          currentBlock.length = 0;
        }
        currentBlock.push("*".repeat(Environment.LOG_LINE_LENGTH));
        insideExecution = true;
        continue;
      }
      if (marker === "#") {
        if (insideExecution) {
          currentBlock.push("#".repeat(Environment.LOG_LINE_LENGTH));
          const blockContent = currentBlock.join("\n").trim();
          if (TestAutomationLogger.isMeaningfulExecutionBlock(blockContent)) {
            blocks.push(blockContent);
          }
          currentBlock.length = 0;
          insideExecution = false;
        }
        continue;
      }
      if (insideExecution) {
        currentBlock.push(line);
      }
    }
    return blocks;
  }

  private static getBoundaryMarker(line: string): "*" | "#" | undefined {
    const normalizedLine = line.replace(/\u001b\[[0-9;]*m/g, EMPTY).trim();
    const markerMatch = normalizedLine.match(
      new RegExp(
        `^(?:.*?)(\\*{${Environment.LOG_LINE_LENGTH}}|#{${Environment.LOG_LINE_LENGTH}})(?:.*)?$`,
      ),
    );
    return markerMatch
      ? markerMatch[1].startsWith("*")
        ? "*"
        : "#"
      : undefined;
  }

  private static extractExecutionTag(content: string): string {
    const match =
      content.match(
        new RegExp(`@${Environment.JIRA_BOARD}-[A-Za-z0-9._-]+`, "i"),
      ) ??
      content.match(
        new RegExp(`${Environment.JIRA_BOARD}-[A-Za-z0-9._-]+`, "i"),
      );
    return match ? match[0].replace(/^@/, EMPTY) : EMPTY;
  }

  private static isMeaningfulExecutionBlock(content: string): boolean {
    const nonMarkerLines = content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .filter((line) => line !== "*".repeat(100))
      .filter((line) => line !== "#".repeat(100));
    return nonMarkerLines.length > 0;
  }

  private static isCompleteExecutionBlock(content: string): boolean {
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      return false;
    }
    const lines = trimmedContent.split(/\r?\n/).map((line) => line.trim());
    const hasStartMarker = lines.some(
      (line) => TestAutomationLogger.getBoundaryMarker(line) === "*",
    );
    const hasEndMarker = lines.some(
      (line) => TestAutomationLogger.getBoundaryMarker(line) === "#",
    );
    return (
      hasStartMarker &&
      hasEndMarker &&
      TestAutomationLogger.isMeaningfulExecutionBlock(trimmedContent)
    );
  }

  private static extractTimestampFromFileName(fileName: string): string {
    const match = fileName.match(/(\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2})/);
    return match ? match[1] : EMPTY;
  }

  static async removeTempFiles(): Promise<void> {
    await TestAutomationLogger.removeTempFilesFromDirectory(
      path.resolve(LOG_FOLDER),
    );
  }

  private static async removeTempFilesFromDirectory(
    directoryPath: string,
  ): Promise<void> {
    if (!fs.existsSync(directoryPath)) {
      return;
    }
    const entries = await fs.promises.readdir(directoryPath, {
      withFileTypes: true,
    });
    for (const entry of entries) {
      const entryPath = path.join(directoryPath, entry.name);
      if (entry.isDirectory()) {
        await TestAutomationLogger.removeTempFilesFromDirectory(entryPath);
        continue;
      }
      if (entry.isFile() && /^TEMP/i.test(entry.name)) {
        await fs.promises.unlink(entryPath);
      }
    }
  }
}
