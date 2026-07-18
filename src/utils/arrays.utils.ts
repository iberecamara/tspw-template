import { faker } from "@faker-js/faker";

export class ArraysUtils {
  public static getRandomElements<T>(
    array: T[],
    options?: { quantity?: number; indexLimit?: number; exclude?: T[] },
  ): T[] {
    const amount = options?.quantity ?? 1;

    if (array.length === 0) {
      throw new Error("Array cannot be empty");
    }

    if (amount > array.length) {
      throw new Error("Amount cannot be greater than the array length");
    }

    if (options?.indexLimit && options?.indexLimit > array.length) {
      throw new Error("Index limit cannot be greater than the array length");
    }

    if (options?.indexLimit && options?.indexLimit < amount) {
      throw new Error("Amount cannot be lower than the index limit");
    }

    if (options?.indexLimit) {
      array = array.slice(0, options.indexLimit);
    }

    if (options?.exclude) {
      const available = array.filter(
        (element) => !options?.exclude?.includes(element),
      );
      if (amount > available.length) {
        throw new Error(
          "Requested amount exceeds available non-excluded elements",
        );
      }
    }

    const elements: T[] = [];
    const usedIndices = new Set<number>();

    while (elements.length < amount) {
      const randomIndex = faker.number.int({ min: 0, max: array.length - 1 });
      if (
        !usedIndices.has(randomIndex) &&
        !options?.exclude?.includes(array[randomIndex])
      ) {
        usedIndices.add(randomIndex);
        elements.push(array[randomIndex]);
      }
    }

    return elements;
  }

  public static getRandomElement<T>(
    array: T[],
    options?: { exclude?: T[] },
  ): T {
    return ArraysUtils.getRandomElements(array, {
      exclude: options?.exclude,
    })[0];
  }
}
