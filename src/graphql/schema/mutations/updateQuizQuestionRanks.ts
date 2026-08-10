import { GraphQLFieldConfig, GraphQLList, GraphQLNonNull } from 'graphql';

import { UpdateQuizQuestionRankInput as UpdateQuizQuestionRankInputType } from '../../../types/schema-types.js';
import { ContextType } from '../../../types/types.js';
import { ErrorType } from '../../../utils/ErrorType.js';
import { authenticated } from '../../utils/auth.js';
import UpdateQuizQuestionRankInput from '../inputs/UpdateQuizQuestionRank.js';
import MutationResult from '../types/MutationResult.js';
import logger from '../../../utils/logger.js';

const updateQuizQuestionRanks: GraphQLFieldConfig<null, ContextType> = {
  type: MutationResult,
  description: 'Updates the ranks of multiple quiz questions.',
  args: {
    questionRanks: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UpdateQuizQuestionRankInput))),
      description: 'The quiz questions and their new ranks',
    },
  },
  resolve: authenticated(
    async (
      _,
      { questionRanks }: { questionRanks: UpdateQuizQuestionRankInputType[] },
      { db, loaders, user },
    ) => {
      if (!questionRanks.length) {
        return {
          success: false,
          errors: [new Error(ErrorType.INVALID_INPUT)],
        };
      }

      try {
        // Verify quiz ownership through the first question
        const questionId = parseInt(questionRanks[0].id, 10);
        const question = await loaders.QuizQuestion.loadById(questionId);
        const quiz = question ? await loaders.Quiz.loadById(question.quiz_id) : null;

        if (!quiz || quiz.teacher_id !== user.id) {
          return {
            success: false,
            errors: [new Error(ErrorType.FORBIDDEN)],
          };
        }

        await db.transaction(async (transaction) => {
          for (const item of questionRanks) {
            await transaction('quiz_question').where('id', item.id).update({
              rank: item.rank,
              updated_at: db.fn.now(),
            });

            loaders.QuizQuestion.loaders.byIdLoader.clear(parseInt(item.id, 10));
          }
        });

        loaders.QuizQuestion.loaders.byQuizIdLoader.clear(quiz.id);

        return {
          success: true,
          errors: [],
        };
      } catch (error) {
        logger.error({ err: error, userId: user.id }, 'Failed to update quiz question ranks');
        return {
          success: false,
          errors: [new Error(ErrorType.INTERNAL_SERVER_ERROR)],
        };
      }
    },
  ),
};

export default updateQuizQuestionRanks;
