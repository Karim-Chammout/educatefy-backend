/**
 * DataLoader mapping utilities.
 *
 * DataLoader's batch function must return an array whose items are in the
 * exact same order as the input keys array. These helpers take the flat
 * results returned from the database and re-map them correctly.
 *
 * Two cases exist:
 *
 *  - mapTo        → one-to-one  (each key maps to a single row, e.g. load by id / slug)
 *  - mapToMany    → one-to-many (each key maps to an array of rows, e.g. load by foreign key)
 */

/**
 * Re-orders a flat array of database rows so that each position in the
 * returned array corresponds to the same position in `keys`.
 *
 * If no row is found for a given key the slot is filled with `undefined`,
 * which DataLoader will surface as a cache miss (the caller's Promise
 * resolves to `undefined`).
 *
 * @example
 * // Inside a byId batch function:
 * const rows = await db.table('course').whereIn('id', ids).select();
 * return mapTo(ids, rows, (r) => r.id);
 */
export function mapTo<K, V>(
  keys: ReadonlyArray<K>,
  rows: ReadonlyArray<V>,
  getKey: (row: V) => K,
): Array<V | undefined> {
  const map = new Map<K, V>();

  for (const row of rows) {
    map.set(getKey(row), row);
  }

  return keys.map((key) => map.get(key));
}

/**
 * Groups a flat array of database rows by key so that each position in the
 * returned array corresponds to the same position in `keys`.
 *
 * Every slot is always an array (empty when no rows match), which is the
 * correct return type for one-to-many DataLoader batch functions.
 *
 * @example
 * // Inside a byCourseId batch function:
 * const rows = await db.table('enrollment').whereIn('course_id', courseIds).select();
 * return mapToMany(courseIds, rows, (r) => r.course_id);
 */
export function mapToMany<K, V>(
  keys: ReadonlyArray<K>,
  rows: ReadonlyArray<V>,
  getKey: (row: V) => K,
): Array<ReadonlyArray<V>> {
  const map = new Map<K, V[]>();

  for (const key of keys) {
    map.set(key, []);
  }

  for (const row of rows) {
    const key = getKey(row);
    const bucket = map.get(key);

    if (bucket) {
      bucket.push(row);
    }
  }

  return keys.map((key) => map.get(key) ?? []);
}
