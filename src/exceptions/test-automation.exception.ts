export class TestAutomationException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TestAutomationException";
  }
}
