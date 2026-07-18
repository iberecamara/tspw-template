import { HTML_REPORTS_DIR } from "@configs/paths";
import { NEWLINE } from "@data/constants/constants";
import { execSync } from "node:child_process";

export class HtmlReportUtils {
  private static run(cmd: string): void {
    execSync(cmd, { stdio: "inherit" });
  }

  static open(): void {
    this.run(`npx playwright show-report '${HTML_REPORTS_DIR}'`);
  }
}

if (require.main === module) {
  type Command = "open";
  const command = process.argv[2] as Command | undefined;

  switch (command) {
    case "open":
      HtmlReportUtils.open();
      break;
    default:
      console.error(
        `Unknown or missing command: '${String(command) ?? ""}'${NEWLINE}Expected one of: open`,
      );
  }
}
