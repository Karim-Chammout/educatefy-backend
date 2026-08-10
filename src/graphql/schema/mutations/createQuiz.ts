import { GraphQLFieldConfig, GraphQLNonNull } from 'graphql';

import { CourseSectionItemContentTypeEnumType } from '../../../types/db-generated-types.js';
import { QuizInfoInput as QuizInfoInputType } from '../../../types/schema-types.js';
import { ContextType } from '../../../types/types.js';
import { ErrorType } from '../../../utils/ErrorType.js';
import { authenticated } from '../../utils/auth.js';
import { hasTeacherRole } from '../../utils/hasTeacherRole.js';
import QuizInfoInput from '../inputs/QuizInfo.js';
import { CreateOrUpdateQuizResult } from '../types/CreateOrUpdateQuizResult.js';
import logger from '../../../utils/logger.js';

const createQuiz: GraphQLFieldConfig<null, ContextType> = {
  type: CreateOrUpdateQuizResult,
  description: 'Creates a quiz.',
  args: {
    quizInfo: {
      type: new GraphQLNonNull(QuizInfoInput),
      description: 'The quiz information',
    },
  },
  resolve: authenticated(
    async (_, { quizInfo }: { quizInfo: QuizInfoInputType }, { db, loaders, user }) => {
      const {
        courseId,
        sectionId,
        denomination,
        is_published,
        questions,
        passing_score = 70,
        max_attempts = 3,
        shuffle_questions = false,
        shuffle_answers = false,
        navigation_mode = 'free',
        questions_per_page = 0,
        show_correct_answers = true,
        time_limit_minutes,
        feedback_passed,
        feedback_failed,
      } = quizInfo;

      const effectivePassingScore = passing_score ?? 70;
      const effectiveMaxAttempts = max_attempts ?? 3;

      if (!courseId || !sectionId || !denomination || !questions?.length) {
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

      if (
        !isValidQuizStructure ||
        effectivePassingScore < 0 ||
        effectivePassingScore > 100 ||
        effectiveMaxAttempts < 0
      ) {
        return {
          success: false,
          errors: [new Error(ErrorType.INVALID_INPUT)],
          quiz: null,
        };
      }

      try {
        const isTeacher = await hasTeacherRole(loaders, user.roleId);

        if (!isTeacher) {
          return {
            success: false,
            errors: [new Error(ErrorType.PERMISSION_DENIED)],
            quiz: null,
          };
        }

        const parsedCourseId = parseInt(courseId, 10);
        const course = await loaders.Course.loadById(parsedCourseId);

        if (!course) {
          return {
            success: false,
            errors: [new Error(ErrorType.NOT_FOUND)],
            quiz: null,
          };
        }

        if (course.teacher_id !== user.id) {
          return {
            success: false,
            errors: [new Error(ErrorType.FORBIDDEN)],
            quiz: null,
          };
        }

        const parsedSectionId = parseInt(sectionId, 10);
        const section = await loaders.CourseSection.loadById(parsedSectionId);

        if (!section || section.course_id !== course.id) {
          return {
            success: false,
            errors: [new Error(ErrorType.INVALID_INPUT)],
            quiz: null,
          };
        }

        const createdQuiz = await db.transaction(async (transaction) => {
          const [quiz] = await transaction('quiz')
            .insert({
              denomination: denomination.trim(),
              is_published,
              course_id: course.id,
              teacher_id: user.id,
              passing_score: effectivePassingScore,
              max_attempts: effectiveMaxAttempts,
              shuffle_questions,
              shuffle_answers,
              navigation_mode,
              questions_per_page,
              show_correct_answers,
              time_limit_minutes: time_limit_minutes ?? null,
              feedback_passed: feedback_passed ?? null,
              feedback_failed: feedback_failed ?? null,
            })
            .returning('id');

          await transaction('course_section_item').insert({
            course_section_id: parsedSectionId,
            content_id: quiz.id,
            content_type: CourseSectionItemContentTypeEnumType.Quiz,
          });

          for (const [questionIndex, question] of questions.entries()) {
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

            for (const [answerIndex, answer] of question.answers.entries()) {
              await transaction('quiz_answer').insert({
                question_id: createdQuestion.id,
                denomination: answer.denomination ?? null,
                image_url: answer.image_url ?? null,
                is_correct: answer.is_correct ?? false,
                rank: answer.rank ?? answerIndex,
              });
            }
          }

          return quiz;
        });

        loaders.Quiz.loaders.byIdLoader.clear(createdQuiz.id);
        loaders.Quiz.loaders.byCourseIdLoader.clear(course.id);

        return {
          success: true,
          errors: [],
          quiz: createdQuiz,
        };
      } catch (error) {
        logger.error({ err: error, userId: user.id }, 'Failed to create quiz');
        return {
          success: false,
          errors: [new Error(ErrorType.INTERNAL_SERVER_ERROR)],
          quiz: null,
        };
      }
    },
  ),
};

export default createQuiz;
