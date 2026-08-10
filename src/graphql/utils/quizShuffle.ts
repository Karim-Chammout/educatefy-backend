/**
 * Deterministic pseudo-random shuffle utilities used to randomize quiz questions
 * and answers per attempt. Given the same seed and input, the output order is
 * always identical, which keeps the student's experience reproducible.
 */

/** A small fast PRNG (mulberry32) seeded with a 32-bit integer. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;

  return function random() {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates shuffle driven by a seeded PRNG. Returns a new array. */
export function seededShuffle<T>(input: readonly T[], seed: number): T[] {
  const shuffled = [...input];
  const random = mulberry32(seed);

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}
