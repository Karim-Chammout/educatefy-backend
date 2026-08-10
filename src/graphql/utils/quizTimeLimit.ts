export const QUIZ_SUBMIT_GRACE_SECONDS = 5;

/**
 * Whether a quiz attempt has exceeded its time limit (plus a small grace
 * period to absorb network latency).
 */
export function isQuizAttemptExpired(
  timeLimitMinutes: number | null,
  startedAt: Date | string,
  now: Date,
): boolean {
  if (timeLimitMinutes === null || timeLimitMinutes <= 0) {
    return false;
  }

  const elapsedSeconds = (now.getTime() - new Date(startedAt).getTime()) / 1000;

  return elapsedSeconds > timeLimitMinutes * 60 + QUIZ_SUBMIT_GRACE_SECONDS;
}
