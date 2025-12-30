/**
 * This function takes a promise of an array and removes all elements from it that are Errors
 *
 * @param promise A promise that resolves to an array of items or Errors
 */
export async function filterError<T>(
  promise: Promise<ReadonlyArray<T | Error>>,
): Promise<ReadonlyArray<T>> {
  const results = await promise;

  return results.filter((item): item is T => !(item instanceof Error));
}
