import { randomInt } from 'node:crypto';

import { GraphQLFieldConfig, GraphQLNonNull, GraphQLString } from 'graphql';

import { ContextType } from '../../../types/types.js';
import { EnrollmentStatusType } from '../../../types/db-generated-types.js';
import { ErrorType } from '../../../utils/ErrorType.js';
import { authenticated } from '../../utils/auth.js';
import { seededShuffle } from '../../utils/quizShuffle.js';
import { StartQuizResult } from '../types/StartQuizResult.js';
import logger from '../../../utils/logger.js';

type AnswerSnapshot = {
  id: number;
  denomination: string | null;
  image_url: string | null;
  is_correct: boolean;
};

const startQuiz: GraphQLFieldConfig<null, ContextType> = {
  type: StartQuizResult,
  description: 'Starts a quiz attempt for the current student.',
  args: {
    quizId: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The ID of the quiz to start.',
    },
  },
  resolve: authenticated(async (_, { quizId }: { quizId: string }, { db, loaders, user }) => {
    const quizIdParsed = parseInt(quizId, 10);
    const quiz = await loaders.Quiz.loadById(quizIdParsed);

    if (!quiz) {
      return {
        success: false,
        errors: [new Error(ErrorType.NOT_FOUND)],
        quizAttempt: null,
        timeLimitMinutes: null,
      };
    }

    if (!quiz.is_published) {
      return {
        success: false,
        errors: [new Error(ErrorType.NOT_FOUND)],
        quizAttempt: null,
        timeLimitMinutes: null,
      };
    }

    const enrollment = await loaders.Enrollment.loadByAccountIdAndCourseId(user.id, quiz.course_id);

    if (
      !enrollment ||
      enrollment.status === EnrollmentStatusType.Available ||
      enrollment.status === EnrollmentStatusType.Unenrolled
    ) {
      return {
        success: false,
        errors: [new Error(ErrorType.NO_ENROLLMENT_FOUND)],
        quizAttempt: null,
        timeLimitMinutes: null,
      };
    }

    try {
      // Resume an existing in-progress attempt if one exists (e.g. after a page refresh).
      const existingInProgress = await db('quiz_attempt')
        .where('quiz_id', quiz.id)
        .where('account_id', user.id)
        .where('status', 'in_progress')
        .first();

      if (existingInProgress) {
        loaders.QuizAttempt.loaders.byIdLoader.clear(existingInProgress.id);

        return {
          success: true,
          errors: [],
          quizAttempt: existingInProgress,
          timeLimitMinutes: quiz.time_limit_minutes,
        };
      }

      const completedAttempts = await db('quiz_attempt')
        .where('quiz_id', quiz.id)
        .where('account_id', user.id)
        .where('status', 'completed')
        .count('id as count')
        .first();

      const completedCount = parseInt(String(completedAttempts?.count ?? 0), 10);

      if (quiz.max_attempts > 0 && completedCount >= quiz.max_attempts) {
        return {
          success: false,
          errors: [new Error(ErrorType.MAX_ATTEMPTS_REACHED)],
          quizAttempt: null,
          timeLimitMinutes: null,
        };
      }

      // Derive the next attempt number from the highest existing one rather than
      // a count, so gaps or deleted rows never collide with the unique constraint.
      const maxAttemptNumberRow = await db('quiz_attempt')
        .where('quiz_id', quiz.id)
        .where('account_id', user.id)
        .max('attempt_number as maxAttemptNumber')
        .first();

      const nextAttemptNumber =
        parseInt(String(maxAttemptNumberRow?.maxAttemptNumber ?? 0), 10) + 1;

      const seed = randomInt(1, 2147483647);

      const createdAttempt = await db.transaction(async (transaction) => {
        const [attempt] = await transaction('quiz_attempt')
          .insert({
            account_id: user.id,
            enrollment_id: enrollment.id,
            quiz_id: quiz.id,
            seed,
            status: 'in_progress',
            attempt_number: nextAttemptNumber,
            started_at: db.fn.now(),
          })
          .returning('*');

        const questions = await loaders.QuizQuestion.loadByQuizId(quiz.id);
        const rankedQuestions = [...questions].sort((a, b) => a.rank - b.rank);

        const orderedQuestions = quiz.shuffle_questions
          ? seededShuffle(rankedQuestions, seed)
          : rankedQuestions;

        for (const [displayIndex, question] of orderedQuestions.entries()) {
          const answers = await loaders.QuizAnswer.loadByQuestionId(question.id);
          const rankedAnswers = [...answers].sort((a, b) => a.rank - b.rank);

          const orderedAnswers = quiz.shuffle_answers
            ? seededShuffle(rankedAnswers, seed + question.id)
            : rankedAnswers;

          const answerSnapshots: AnswerSnapshot[] = orderedAnswers.map((answer) => ({
            id: answer.id,
            denomination: answer.denomination,
            image_url: answer.image_url,
            is_correct: answer.is_correct,
          }));

          await transaction('quiz_attempt_question').insert({
            attempt_id: attempt.id,
            question_id: question.id,
            prompt: question.prompt,
            question_type: question.question_type,
            rank: displayIndex,
            points: question.points,
            media_url: question.media_url,
            media_type: question.media_type,
            hint: question.hint,
            difficulty: question.difficulty,
            learning_objective: question.learning_objective,
            feedback_correct: question.feedback_correct,
            feedback_incorrect: question.feedback_incorrect,
            answers: JSON.stringify(answerSnapshots),
          });
        }

        return attempt;
      });

      loaders.QuizAttempt.loaders.byIdLoader.clear(createdAttempt.id);

      return {
        success: true,
        errors: [],
        quizAttempt: createdAttempt,
        timeLimitMinutes: quiz.time_limit_minutes,
      };
    } catch (error) {
      logger.error({ err: error, userId: user.id }, 'Failed to start quiz');
      return {
        success: false,
        errors: [new Error(ErrorType.INTERNAL_SERVER_ERROR)],
        quizAttempt: null,
        timeLimitMinutes: null,
      };
    }
  }),
};

export default startQuiz;
