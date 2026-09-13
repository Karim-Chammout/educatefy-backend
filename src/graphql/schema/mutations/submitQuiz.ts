import { GraphQLFieldConfig, GraphQLNonNull } from 'graphql';

import { QuizSubmissionInput as QuizSubmissionInputType } from '../../../types/schema-types.js';
import { QuizAttemptStatusEnumType } from '../../../types/db-generated-types.js';
import { ContextType } from '../../../types/types.js';
import { ErrorType } from '../../../utils/ErrorType.js';
import { authenticated } from '../../utils/auth.js';
import { recomputeProgressAndAutoCompleteCourse } from '../../utils/recomputeProgressAndAutoCompleteCourse.js';
import { computeCourseProgress } from '../../utils/computeCourseProgress.js';
import { isQuizAttemptExpired } from '../../utils/quizTimeLimit.js';
import QuizSubmissionInput from '../inputs/QuizSubmission.js';
import { SubmitQuizResult } from '../types/SubmitQuizResult.js';
import logger from '../../../utils/logger.js';

type AnswerSnapshot = {
  id: number;
  denomination: string | null;
  image_url: string | null;
  is_correct: boolean;
};

const submitQuiz: GraphQLFieldConfig<null, ContextType> = {
  type: SubmitQuizResult,
  description: 'Submits a quiz attempt and grades it server-side.',
  args: {
    submission: {
      type: new GraphQLNonNull(QuizSubmissionInput),
      description: 'The quiz submission',
    },
  },
  resolve: authenticated(
    async (_, { submission }: { submission: QuizSubmissionInputType }, { db, loaders, user }) => {
      const { attemptId, answers } = submission;

      if (!attemptId || !answers) {
        return {
          success: false,
          errors: [new Error(ErrorType.INVALID_INPUT)],
          quizAttempt: null,
        };
      }

      try {
        const attemptIdParsed = parseInt(attemptId, 10);
        const attempt = await loaders.QuizAttempt.loadById(attemptIdParsed);

        if (!attempt || attempt.account_id !== user.id) {
          return {
            success: false,
            errors: [new Error(ErrorType.NOT_FOUND)],
            quizAttempt: null,
          };
        }

        if (attempt.status === QuizAttemptStatusEnumType.Completed) {
          return {
            success: false,
            errors: [new Error(ErrorType.INVALID_STATE)],
            quizAttempt: null,
          };
        }

        const quiz = await loaders.Quiz.loadById(attempt.quiz_id);

        if (!quiz) {
          return {
            success: false,
            errors: [new Error(ErrorType.NOT_FOUND)],
            quizAttempt: null,
          };
        }

        const attemptQuestions = await loaders.QuizAttemptQuestion.loadByAttemptId(attempt.id);
        const rankedAttemptQuestions = [...attemptQuestions].sort((a, b) => a.rank - b.rank);

        // Server-authoritative elapsed time (both values come from the DB clock)
        const nowRow = await db.raw('select now() as now');
        const nowTime = new Date(nowRow.rows[0].now);

        const timedOut = isQuizAttemptExpired(quiz.time_limit_minutes, attempt.started_at, nowTime);

        const answersByQuestion = new Map<number, number[]>();
        for (const answerGroup of answers) {
          const questionId = parseInt(answerGroup.questionId, 10);
          answersByQuestion.set(
            questionId,
            answerGroup.answerIds?.map((id) => parseInt(id, 10)) ?? [],
          );
        }

        const gradingResult = await db.transaction(async (transaction) => {
          // Atomically claim the attempt. Two concurrent submissions race
          // here: the second transaction blocks on the row lock, then sees the
          // completed status and backs off, so answers are only ever inserted
          // once and the final score cannot be overwritten by a late twin.
          const [lockedAttempt] = await transaction('quiz_attempt')
            .where('id', attempt.id)
            .forUpdate()
            .select();

          if (!lockedAttempt || lockedAttempt.status !== QuizAttemptStatusEnumType.InProgress) {
            return null;
          }

          let earnedPoints = 0;
          let totalPoints = 0;

          for (const question of rankedAttemptQuestions) {
            totalPoints += question.points;

            const snapshotAnswers = question.answers as unknown as AnswerSnapshot[];
            const answersById = new Map(snapshotAnswers.map((a) => [a.id, a]));
            const selectedIds = [
              ...new Set(
                (answersByQuestion.get(question.id) ?? []).filter((id) => answersById.has(id)),
              ),
            ];
            const correctIds = snapshotAnswers.filter((a) => a.is_correct).map((a) => a.id);

            const selectedSet = new Set(selectedIds);
            const correctSet = new Set(correctIds);
            const isCorrect =
              selectedSet.size === correctSet.size &&
              [...correctSet].every((id) => selectedSet.has(id));

            if (isCorrect) {
              earnedPoints += question.points;
            }

            for (const selectedId of selectedIds) {
              const selectedAnswer = answersById.get(selectedId);

              await transaction('quiz_attempt_answer').insert({
                attempt_id: attempt.id,
                attempt_question_id: question.id,
                answer_id: selectedId,
                denomination: selectedAnswer?.denomination ?? null,
                image_url: selectedAnswer?.image_url ?? null,
                is_correct: selectedAnswer?.is_correct ?? false,
              });
            }
          }

          const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
          const passed = score >= quiz.passing_score;

          const [updatedAttempt] = await transaction('quiz_attempt')
            .where('id', attempt.id)
            .update({
              status: QuizAttemptStatusEnumType.Completed,
              score,
              earned_points: earnedPoints,
              total_points: totalPoints,
              passed,
              timed_out: timedOut,
              submitted_at: db.fn.now(),
              updated_at: db.fn.now(),
            })
            .returning('*');

          // If this passing attempt completes the last content, auto-complete
          // the enrollment in the same transaction.
          const { courseCompleted, progress } = passed
            ? await recomputeProgressAndAutoCompleteCourse(transaction, user.id, quiz.course_id)
            : {
                courseCompleted: false,
                progress: await computeCourseProgress(
                  transaction,
                  user.id,
                  quiz.course_id,
                  attempt.enrollment_id,
                  false,
                ),
              };

          return { gradedAttempt: updatedAttempt, courseCompleted, progress };
        });

        if (!gradingResult || !gradingResult.gradedAttempt) {
          return {
            success: false,
            errors: [new Error(ErrorType.INVALID_STATE)],
            quizAttempt: null,
          };
        }

        loaders.QuizAttempt.loaders.byIdLoader.clear(attempt.id);
        loaders.QuizAttemptAnswer.loaders.byAttemptIdLoader.clear(attempt.id);
        loaders.QuizAttemptQuestion.loaders.byAttemptIdLoader.clear(attempt.id);
        loaders.Enrollment.loaders.byAccountIdAndCourseIdLoader.clear({
          accountId: user.id,
          courseId: quiz.course_id,
        });

        return {
          success: true,
          errors: [],
          quizAttempt: gradingResult.gradedAttempt,
          courseCompleted: gradingResult.courseCompleted,
          progress: gradingResult.progress,
        };
      } catch (error) {
        logger.error({ err: error, userId: user.id }, 'Failed to submit quiz');
        return {
          success: false,
          errors: [new Error(ErrorType.INTERNAL_SERVER_ERROR)],
          quizAttempt: null,
        };
      }
    },
  ),
};

export default submitQuiz;
