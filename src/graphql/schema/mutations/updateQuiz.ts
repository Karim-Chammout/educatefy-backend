import { GraphQLFieldConfig, GraphQLNonNull } from 'graphql';

import { UpdateQuizInfoInput as UpdateQuizInfoInputType } from '../../../types/schema-types.js';
import { ContextType } from '../../../types/types.js';
import { ErrorType } from '../../../utils/ErrorType.js';
import { authenticated } from '../../utils/auth.js';
import UpdateQuizInfoInput from '../inputs/UpdateQuizInfo.js';
import { CreateOrUpdateQuizResult } from '../types/CreateOrUpdateQuizResult.js';
import logger from '../../../utils/logger.js';

const updateQuiz: GraphQLFieldConfig<null, ContextType> = {
  type: CreateOrUpdateQuizResult,
  description: 'Updates a quiz.',
  args: {
    quizInfo: {
      type: new GraphQLNonNull(UpdateQuizInfoInput),
      description: 'The quiz information',
    },
  },
  resolve: authenticated(
    async (_, { quizInfo }: { quizInfo: UpdateQuizInfoInputType }, { db, loaders, user }) => {
      const { id, questions } = quizInfo;

      if (!id || !questions?.length) {
        return {
          success: false,
          errors: [new Error(ErrorType.INVALID_INPUT)],
          quiz: null,
        };
      }

      const isValidQuizStructure =
        questions.every(
          (question) =>
            question.prompt &&
            question.question_type &&
            question.answers?.length &&
            question.answers.some((answer) => answer.is_correct),
        ) && questions.every((question) => (question.points ?? 1) >= 1);

      if (!isValidQuizStructure) {
        return {
          success: false,
          errors: [new Error(ErrorType.INVALID_INPUT)],
          quiz: null,
        };
      }

      try {
        const quizId = parseInt(id, 10);
        const quiz = await loaders.Quiz.loadById(quizId);

        if (!quiz) {
          return {
            success: false,
            errors: [new Error(ErrorType.NOT_FOUND)],
            quiz: null,
          };
        }

        if (quiz.teacher_id !== user.id) {
          return {
            success: false,
            errors: [new Error(ErrorType.FORBIDDEN)],
            quiz: null,
          };
        }

        const existingQuestions = await loaders.QuizQuestion.loadByQuizId(quiz.id);

        const existingAnswersByQuestion = new Map<
          number,
          Awaited<ReturnType<typeof loaders.QuizAnswer.loadByQuestionId>>
        >();
        for (const question of existingQuestions) {
          existingAnswersByQuestion.set(
            question.id,
            await loaders.QuizAnswer.loadByQuestionId(question.id),
          );
        }

        const baseDataToUpdate = {
          ...(quizInfo.denomination && { denomination: quizInfo.denomination.trim() }),
          ...(quizInfo.is_published !== undefined && { is_published: quizInfo.is_published }),
          ...(quizInfo.passing_score !== undefined && { passing_score: quizInfo.passing_score }),
          ...(quizInfo.max_attempts !== undefined && { max_attempts: quizInfo.max_attempts }),
          ...(quizInfo.shuffle_questions !== undefined && {
            shuffle_questions: quizInfo.shuffle_questions,
          }),
          ...(quizInfo.shuffle_answers !== undefined && {
            shuffle_answers: quizInfo.shuffle_answers,
          }),
          ...(quizInfo.navigation_mode !== undefined && {
            navigation_mode: quizInfo.navigation_mode,
          }),
          ...(quizInfo.questions_per_page !== undefined && {
            questions_per_page: quizInfo.questions_per_page,
          }),
          ...(quizInfo.show_correct_answers !== undefined && {
            show_correct_answers: quizInfo.show_correct_answers,
          }),
          ...(quizInfo.feedback_passed !== undefined && {
            feedback_passed: quizInfo.feedback_passed ?? null,
          }),
          ...(quizInfo.feedback_failed !== undefined && {
            feedback_failed: quizInfo.feedback_failed ?? null,
          }),
          ...(quizInfo.time_limit_minutes !== undefined && {
            time_limit_minutes: quizInfo.time_limit_minutes ?? null,
          }),
        };

        await db.transaction(async (transaction) => {
          await transaction('quiz')
            .where('id', quiz.id)
            .update({ ...baseDataToUpdate, updated_at: db.fn.now() });

          const inputQuestionIds = new Set<number>();

          for (const [questionIndex, question] of questions.entries()) {
            const existingQuestion = question.id
              ? existingQuestions.find((q) => q.id === parseInt(question.id as string, 10))
              : undefined;

            let questionId: number;

            if (existingQuestion) {
              inputQuestionIds.add(existingQuestion.id);
              questionId = existingQuestion.id;

              await transaction('quiz_question')
                .where('id', existingQuestion.id)
                .update({
                  prompt: question.prompt.trim(),
                  question_type: question.question_type,
                  points: question.points ?? existingQuestion.points,
                  rank: question.rank ?? questionIndex,
                  media_url: question.media_url ?? null,
                  media_type: question.media_type ?? null,
                  hint: question.hint ?? null,
                  difficulty: question.difficulty ?? null,
                  learning_objective: question.learning_objective ?? null,
                  feedback_correct: question.feedback_correct ?? null,
                  feedback_incorrect: question.feedback_incorrect ?? null,
                  updated_at: db.fn.now(),
                });
            } else {
              const [createdQuestion] = await transaction('quiz_question')
                .insert({
                  quiz_id: quiz.id,
                  prompt: question.prompt.trim(),
                  question_type: question.question_type,
                  points: question.points ?? 1,
                  rank: question.rank ?? questionIndex,
                  media_url: question.media_url ?? null,
                  media_type: question.media_type ?? null,
                  hint: question.hint ?? null,
                  difficulty: question.difficulty ?? null,
                  learning_objective: question.learning_objective ?? null,
                  feedback_correct: question.feedback_correct ?? null,
                  feedback_incorrect: question.feedback_incorrect ?? null,
                })
                .returning('id');

              questionId = createdQuestion.id;
              existingAnswersByQuestion.set(createdQuestion.id, []);
            }

            const existingAnswers = existingAnswersByQuestion.get(questionId) ?? [];
            const inputAnswerIds = new Set<number>();

            for (const [answerIndex, answer] of question.answers.entries()) {
              const existingAnswer = answer.id
                ? existingAnswers.find((a) => a.id === parseInt(answer.id as string, 10))
                : undefined;

              if (existingAnswer) {
                inputAnswerIds.add(existingAnswer.id);

                await transaction('quiz_answer')
                  .where('id', existingAnswer.id)
                  .update({
                    denomination: answer.denomination ?? null,
                    image_url: answer.image_url ?? null,
                    is_correct: answer.is_correct ?? false,
                    rank: answer.rank ?? answerIndex,
                    updated_at: db.fn.now(),
                  });
              } else {
                await transaction('quiz_answer').insert({
                  question_id: questionId,
                  denomination: answer.denomination ?? null,
                  image_url: answer.image_url ?? null,
                  is_correct: answer.is_correct ?? false,
                  rank: answer.rank ?? answerIndex,
                });
              }
            }

            const answersToDelete = existingAnswers.filter((a) => !inputAnswerIds.has(a.id));

            for (const answer of answersToDelete) {
              await transaction('quiz_answer').where('id', answer.id).del();
            }
          }

          const questionsToDelete = existingQuestions.filter(
            (question) => !inputQuestionIds.has(question.id),
          );

          for (const question of questionsToDelete) {
            await transaction('quiz_question').where('id', question.id).del();
          }
        });

        loaders.Quiz.loaders.byIdLoader.clear(quiz.id);
        loaders.QuizQuestion.loaders.byQuizIdLoader.clear(quiz.id);
        for (const question of existingQuestions) {
          loaders.QuizQuestion.loaders.byIdLoader.clear(question.id);
          const answers = existingAnswersByQuestion.get(question.id) ?? [];
          for (const answer of answers) {
            loaders.QuizAnswer.loaders.byIdLoader.clear(answer.id);
          }
        }

        return {
          success: true,
          errors: [],
          quiz: { id: quiz.id },
        };
      } catch (error) {
        logger.error({ err: error, userId: user.id }, 'Failed to update quiz');
        return {
          success: false,
          errors: [new Error(ErrorType.INTERNAL_SERVER_ERROR)],
          quiz: null,
        };
      }
    },
  ),
};

export default updateQuiz;
