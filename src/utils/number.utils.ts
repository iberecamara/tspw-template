import { faker } from "@faker-js/faker";

export class NumberUtils {
  public static getRandomNumber(options?: {
    min?: number;
    max?: number;
  }): number {
    return faker.number.int({ min: options?.min, max: options?.max });
  }

  public static getRandomCreditCardNumber(): number {
    return +faker.finance.creditCardNumber("################");
  }

  public static getRandomCreditCardCvc(): number {
    return +faker.finance.creditCardCVV();
  }

  public static getRandomCreditCardExpirationMonth(): number {
    return faker.date.future().getUTCMonth() + 1;
  }

  public static getRandomCreditCardExpirationYear(): number {
    return faker.date.future().getUTCFullYear();
  }
}
