import { GraphQLFieldConfig, GraphQLList, GraphQLNonNull } from 'graphql';

import { UpdateQuizAnswerRankInput as UpdateQuizAnswerRankInputType } from '../../../types/schema-types.js';
import { ContextType } from '../../../types/types.js';
import { ErrorType } from '../../../utils/ErrorType.js';
import { authenticated } from '../../utils/auth.js';
import UpdateQuizAnswerRankInput from '../inputs/UpdateQuizAnswerRank.js';
import MutationResult from '../types/MutationResult.js';
import logger from '../../../utils/logger.js';

const updateQuizAnswerRanks: GraphQLFieldConfig<null, ContextType> = {
  type: MutationResult,
  description: 'Updates the ranks of multiple quiz answers.',
  args: {
    answerRanks: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UpdateQuizAnswerRankInput))),
      description: 'The quiz answers and their new ranks',
    },
  },
  resolve: authenticated(
    async (
      _,
      { answerRanks }: { answerRanks: UpdateQuizAnswerRankInputType[] },
      { db, loaders, user },
    ) => {
      if (!answerRanks.length) {
        return {
          success: false,
          errors: [new Error(ErrorType.INVALID_INPUT)],
        };
      }

      try {
        // Verify quiz ownership through the first answer
        const answerId = parseInt(answerRanks[0].id, 10);
        const answer = await loaders.QuizAnswer.loadById(answerId);
        const question = answer ? await loaders.QuizQuestion.loadById(answer.question_id) : null;
        const quiz = question ? await loaders.Quiz.loadById(question.quiz_id) : null;

        if (!quiz || quiz.teacher_id !== user.id) {
          return {
            success: false,
            errors: [new Error(ErrorType.FORBIDDEN)],
          };
        }

        await db.transaction(async (transaction) => {
          for (const item of answerRanks) {
            await transaction('quiz_answer').where('id', item.id).update({
              rank: item.rank,
              updated_at: db.fn.now(),
            });

            loaders.QuizAnswer.loaders.byIdLoader.clear(parseInt(item.id, 10));
          }
        });

        loaders.QuizAnswer.loaders.byQuestionIdLoader.clear(answer.question_id);

        return {
          success: true,
          errors: [],
        };
      } catch (error) {
        logger.error({ err: error, userId: user.id }, 'Failed to update quiz answer ranks');
        return {
          success: false,
          errors: [new Error(ErrorType.INTERNAL_SERVER_ERROR)],
        };
      }
    },
  ),
};

export default updateQuizAnswerRanks;
