import type { Knex } from 'knex';

import {
  ContentComponentParentTableEnumType,
  CourseSectionItemContentTypeEnumType,
  QuizAttemptStatusEnumType,
} from '../../types/db-generated-types.js';

export type CourseProgressType = {
  completedComponents: number;
  totalComponents: number;
  progressPercentage: number;
  isCompleted: boolean;
};

/**
 * Computes course progress (component-based).
 *
 * A content component counts toward progress when it is published, and a quiz counts
 * as one component (mirroring how the frontend treats a quiz as one virtual
 * component). The percentage is `completedComponents / totalComponents * 100`, where a
 * component is completed when `content_component_progress.is_completed` is true
 * and a quiz is completed when a `quiz_attempt` with `status = completed` and
 * `passed = true` exists for the account.
 *
 * This shares the component-counting model and published-only filtering with
 * `recomputeProgressAndAutoCompleteCourse`: `progressPercentage === 100` exactly when that
 * gate would auto-complete the enrollment. For the course owner, draft content
 * can be included (`includeDrafts`) to mirror the owner's preview of the course.
 *
 * A course with no content at all yields `0 / 0` and is never "completed".
 */
export const computeCourseProgress = async (
  db: Knex | Knex.Transaction,
  accountId: number,
  courseId: number,
  enrollmentId: number,
  includeDrafts = false,
): Promise<CourseProgressType> => {
  const emptyProgress: CourseProgressType = {
    completedComponents: 0,
    totalComponents: 0,
    progressPercentage: 0,
    isCompleted: false,
  };

  const sectionsQuery = db
    .from('course_section as cs')
    .where('cs.course_id', courseId)
    .whereNull('cs.deleted_at');

  if (!includeDrafts) {
    sectionsQuery.where('cs.is_published', true);
  }

  const sections = await sectionsQuery.select('cs.id');

  const sectionIds = sections.map((row) => Number(row.id));

  if (sectionIds.length === 0) {
    return emptyProgress;
  }

  const sectionItemRows = await db
    .from('course_section_item as csi')
    .whereIn('csi.course_section_id', sectionIds)
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

  // Keep only lesson/quiz targets that are published (unless the owner is
  // previewing drafts) and not soft-deleted.
  const [availableLessons, availableQuizzes] = await Promise.all([
    lessonIds.length > 0
      ? (() => {
          const query = db.from('lesson').whereNull('deleted_at');
          if (!includeDrafts) {
            query.where('is_published', true);
          }
          return query.whereIn('id', lessonIds).select('id');
        })()
      : [],
    quizIds.length > 0
      ? (() => {
          const query = db.from('quiz').whereNull('deleted_at');
          if (!includeDrafts) {
            query.where('is_published', true);
          }
          return query.whereIn('id', quizIds).select('id');
        })()
      : [],
  ]);

  const availableLessonIds = availableLessons.map((row) => Number(row.id));
  const availableQuizIds = availableQuizzes.map((row) => Number(row.id));

  // All published content components belonging to the available lesson items.
  const componentRows =
    availableLessonIds.length > 0
      ? await (() => {
          const query = db.from('content_component');
          if (!includeDrafts) {
            query.where('is_published', true);
          }
          return query
            .whereIn('parent_id', availableLessonIds)
            .where('parent_table', ContentComponentParentTableEnumType.Lesson)
            .select('id');
        })()
      : [];

  const componentIds = componentRows.map((row) => Number(row.id));

  const totalComponents = componentIds.length + availableQuizIds.length;

  if (totalComponents === 0) {
    return emptyProgress;
  }

  let completedComponents = 0;

  if (componentIds.length > 0) {
    const progressRows = await db
      .from('content_component_progress')
      .whereIn('content_component_id', componentIds)
      .where('account_id', accountId)
      .where('enrollment_id', enrollmentId)
      .where('is_completed', true)
      .select('content_component_id');

    completedComponents += new Set(progressRows.map((row) => Number(row.content_component_id)))
      .size;
  }

  if (availableQuizIds.length > 0) {
    const passedRows = await db
      .from('quiz_attempt')
      .whereIn('quiz_id', availableQuizIds)
      .where('account_id', accountId)
      .where('enrollment_id', enrollmentId)
      .where('status', QuizAttemptStatusEnumType.Completed)
      .where('passed', true)
      .select('quiz_id');

    completedComponents += new Set(passedRows.map((row) => Number(row.quiz_id))).size;
  }

  return {
    completedComponents,
    totalComponents,
    progressPercentage: (completedComponents / totalComponents) * 100,
    isCompleted: completedComponents === totalComponents,
  };
};
