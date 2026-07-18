import fs from "fs";
import path from "path";

export class FileUtils {
  static readFile(filename: string): string[] {
    return fs
      .readFileSync(path.resolve(filename), "utf-8")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  }
}
