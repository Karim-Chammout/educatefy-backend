import type { Knex } from 'knex';

import { EnrollmentStatusType } from '../../types/db-generated-types.js';
import { computeCourseProgress, CourseProgressType } from './computeCourseProgress.js';

/**
 * Recomputes course progress and auto-completes the enrollment when finished.
 *
 * Recomputes the student's progress for a course (all content components completed
 * AND all quizzes passed) and, if so, auto-completes the enrollment in the same
 * transaction, recording the transition in `enrollment_history`. Always returns the
 * freshly recomputed progress so callers can use it directly instead of calling
 * `computeCourseProgress` again after a progress-affecting write.
 *
 * The completeness check delegates to `computeCourseProgress` (published-content
 * component-counting model): `isCompleted` is true exactly when `progressPercentage === 100`, so the
 * completion gate and the progress metric can never drift apart.
 *
 * Completion is a snapshot: an already-`completed` enrollment is a no-op and is never
 * downgraded later (e.g. when a teacher adds new content after completion). A course with
 * no content at all (no sections/items/components/quizzes) is never auto-completed.
 *
 * Only PUBLISHED content counts, mirroring what a student can actually see and interact with
 * (the student-facing resolvers filter sections, items, components and quizzes by
 * `is_published`). If unpublished content were included, a student could never finish a course
 * whose teacher still has drafts in progress.
 *
 * @returns `{ courseCompleted, progress }` — `courseCompleted` is `true` when the enrollment
 * was just transitioned to `completed`. `progress` is the recomputed course progress (always
 * returned so callers can reuse it instead of calling `computeCourseProgress` again).
 */
export const recomputeProgressAndAutoCompleteCourse = async (
  transaction: Knex.Transaction,
  accountId: number,
  courseId: number,
): Promise<{ courseCompleted: boolean; progress: CourseProgressType }> => {
  const enrollment = await transaction('enrollment')
    .where({ account_id: accountId, course_id: courseId })
    .first();

  if (!enrollment || enrollment.status !== EnrollmentStatusType.Enrolled) {
    const progress = await computeCourseProgress(
      transaction,
      accountId,
      courseId,
      enrollment?.id ?? 0,
      false,
    );
    return { courseCompleted: false, progress };
  }

  const progress = await computeCourseProgress(
    transaction,
    accountId,
    courseId,
    enrollment.id,
    false,
  );

  if (!progress.isCompleted) {
    return { courseCompleted: false, progress };
  }

  await transaction('enrollment')
    .where('id', enrollment.id)
    .update({ status: EnrollmentStatusType.Completed, updated_at: transaction.fn.now() });

  await transaction('enrollment_history').insert({
    enrollment_id: enrollment.id,
    old_status: enrollment.status,
    new_status: EnrollmentStatusType.Completed,
  });

  return { courseCompleted: true, progress };
};
