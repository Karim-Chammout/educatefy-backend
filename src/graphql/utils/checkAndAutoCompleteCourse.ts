import type { Knex } from 'knex';

import {
  ContentComponentParentTableEnumType,
  CourseSectionItemContentTypeEnumType,
  EnrollmentStatusType,
  QuizAttemptStatusEnumType,
} from '../../types/db-generated-types.js';

/**
 * Computed course completion.
 *
 * Determines whether a student has completed every piece of content in a course
 * (all content components completed AND all quizzes passed) and, if so, auto-completes
 * the enrollment in the same transaction, recording the transition in `enrollment_history`.
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
 * @returns `true` if the enrollment was just transitioned to `completed`, `false` otherwise.
 */
export const checkAndAutoCompleteCourse = async (
  transaction: Knex.Transaction,
  accountId: number,
  courseId: number,
): Promise<boolean> => {
  const enrollment = await transaction('enrollment')
    .where({ account_id: accountId, course_id: courseId })
    .first();

  if (!enrollment || enrollment.status !== EnrollmentStatusType.Enrolled) {
    return false;
  }

  // Enumerate the course's (published) content via the section items surfaced to students.
  // content_id is polymorphic, so lesson and quiz ids are collected separately.
  const sectionItemRows = await transaction('course_section_item as csi')
    .join('course_section as cs', 'cs.id', 'csi.course_section_id')
    .where('cs.course_id', courseId)
    .where('cs.is_published', true)
    .whereNull('cs.deleted_at')
    .whereNull('csi.deleted_at')
    .select('csi.content_id', 'csi.content_type');

  const lessonIds: number[] = [];
  const quizIds: number[] = [];

  for (const row of sectionItemRows) {
    if (row.content_type === CourseSectionItemContentTypeEnumType.Lesson) {
      lessonIds.push(Number(row.content_id));
    } else if (row.content_type === CourseSectionItemContentTypeEnumType.Quiz) {
      quizIds.push(Number(row.content_id));
    }
  }

  // Keep only lesson/quiz targets that are published and not soft-deleted.
  const [availableLessons, availableQuizzes] = await Promise.all([
    lessonIds.length
      ? transaction('lesson')
          .whereIn('id', lessonIds)
          .where('is_published', true)
          .whereNull('deleted_at')
          .select('id')
      : [],
    quizIds.length
      ? transaction('quiz')
          .whereIn('id', quizIds)
          .where('is_published', true)
          .whereNull('deleted_at')
          .select('id')
      : [],
  ]);

  const availableLessonIds = availableLessons.map((row) => Number(row.id));
  const availableQuizIds = availableQuizzes.map((row) => Number(row.id));

  // All published content components belonging to the available lesson items.
  const componentRows = availableLessonIds.length
    ? await transaction('content_component')
        .whereIn('parent_id', availableLessonIds)
        .where('parent_table', ContentComponentParentTableEnumType.Lesson)
        .where('is_published', true)
        .select('id')
    : [];

  const componentIds = componentRows.map((row) => Number(row.id));

  // A course with no content at all is never auto-completed.
  if (componentIds.length === 0 && availableQuizIds.length === 0) {
    return false;
  }

  let allComponentsCompleted = true;
  let allQuizzesPassed = true;

  if (componentIds.length) {
    const progressRows = await transaction('content_component_progress')
      .whereIn('content_component_id', componentIds)
      .where('account_id', accountId)
      .where('is_completed', true)
      .select('content_component_id');

    const completedIds = new Set(progressRows.map((row) => Number(row.content_component_id)));

    allComponentsCompleted = componentIds.every((id) => completedIds.has(id));
  }

  if (availableQuizIds.length) {
    const passedRows = await transaction('quiz_attempt')
      .whereIn('quiz_id', availableQuizIds)
      .where('account_id', accountId)
      .where('status', QuizAttemptStatusEnumType.Completed)
      .where('passed', true)
      .select('quiz_id');

    const passedQuizIds = new Set(passedRows.map((row) => Number(row.quiz_id)));

    allQuizzesPassed = availableQuizIds.every((id) => passedQuizIds.has(id));
  }

  if (!allComponentsCompleted || !allQuizzesPassed) {
    return false;
  }

  await transaction('enrollment')
    .where('id', enrollment.id)
    .update({ status: EnrollmentStatusType.Completed, updated_at: transaction.fn.now() });

  await transaction('enrollment_history').insert({
    enrollment_id: enrollment.id,
    old_status: enrollment.status,
    new_status: EnrollmentStatusType.Completed,
  });

  return true;
};
