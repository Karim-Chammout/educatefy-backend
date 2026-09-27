/**
 * Resolves a loader result and drops every entry that is not a usable record: `Error`
 * instances, plus the `undefined` holes `mapTo` leaves for keys with no matching row.
 *
 * Only safe when the caller does not rely on the result keeping the input order, since
 * filtering shifts positions. Key the survivors by their own id instead.
 *
 * @param promise A promise that resolves to an array of items, Errors, or holes
 */
export async function filterError<T>(
  promise: Promise<ReadonlyArray<T | Error>>,
): Promise<ReadonlyArray<T>> {
  const results = await promise;

  return results.filter((item): item is T => item != null && !(item instanceof Error));
}
