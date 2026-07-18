import { Environment } from "@configs/environment.config";
import { SECOND_IN_MILISSECONDS } from "@data/constants/common.constants";
import { Locator, Page } from "@playwright/test";

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goToHome(options?: {
    referer?: string;
    timeout?: number;
    waitUntil?: "load" | "domcontentloaded" | "networkidle" | "commit";
  }): Promise<void> {
    await this.page.goto(Environment.BASE_URL, {
      timeout: 30 * SECOND_IN_MILISSECONDS,
      ...options,
    });
  }

  async click(
    locator: Locator,
    options?: {
      button?: "left" | "right" | "middle";
      clickCount?: number;
      delay?: number;
      force?: boolean;
      modifiers?: Array<"Alt" | "Control" | "ControlOrMeta" | "Meta" | "Shift">;
      position?: { x: number; y: number };
      steps?: number;
      timeout?: number;
      trial?: boolean;
    },
  ): Promise<void> {
    await locator.waitFor({ state: "visible" });
    await locator.click(options);
  }

  async checkbox(
    locator: Locator,
    checked: boolean,
    options?: {
      force?: boolean;
      position?: { x: number; y: number };
      trial?: boolean;
    },
  ): Promise<void> {
    if (checked) {
      await locator.check(options);
    } else {
      await locator.uncheck(options);
    }
  }

  async fill(
    locator: Locator,
    text: string,
    options?: {
      force?: boolean;
      timeout?: number;
    },
  ): Promise<void> {
    await locator.fill(text, options);
  }

  async selectOption(
    locator: Locator,
    option: string,
    options?: {
      force?: boolean;
      timeout: number;
    },
  ): Promise<void> {
    await locator.selectOption(option, options);
  }

  async hover(
    locator: Locator,
    options?: {
      force?: boolean;
      modifiers?: Array<"Alt" | "Control" | "ControlOrMeta" | "Meta" | "Shift">;
      position?: { x: number; y: number };
      timeout: number;
      trial?: boolean;
    },
  ): Promise<void> {
    await locator.hover(options);
  }

  async scroll(direction: "down" | "up") {
    const scroller = async (direction: string) => {
      const delay = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));
      const scrollHeight = () => document.body.scrollHeight;
      const start = direction === "down" ? 0 : scrollHeight();
      const shouldStop = (position: number) =>
        direction === "down" ? position > scrollHeight() : position < 0;
      const increment = direction === "down" ? 100 : -100;
      for (let i = start; !shouldStop(i); i += increment) {
        window.scrollTo(0, i);
        await delay(5);
      }
    };
    await this.page.evaluate(scroller, direction);
  }
}
