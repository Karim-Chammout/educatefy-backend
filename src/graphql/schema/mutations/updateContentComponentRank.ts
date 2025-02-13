import { GraphQLFieldConfig, GraphQLList, GraphQLNonNull } from 'graphql';

import { UpdateContentComponentRankInput as UpdateContentComponentRankInputType } from '../../../types/schema-types';
import { ContextType } from '../../../types/types';
import { ErrorType } from '../../../utils/ErrorType';
import { authenticated } from '../../utils/auth';
import { hasTeacherRole } from '../../utils/hasTeacherRole';
import UpdateContentComponentRankInput from '../inputs/UpdateContentComponentRank';
import MutationResult from '../types/MutationResult';

const updateContentComponentRanks: GraphQLFieldConfig<null, ContextType> = {
  type: MutationResult,
  description: 'Updates the ranks of multiple content components.',
  args: {
    componentRanks: {
      type: new GraphQLNonNull(
        new GraphQLList(new GraphQLNonNull(UpdateContentComponentRankInput)),
      ),
      description: 'The content components and their new ranks',
    },
  },
  resolve: authenticated(
    async (
      _,
      { componentRanks }: { componentRanks: UpdateContentComponentRankInputType[] },
      { db, loaders, user },
    ) => {
      if (!componentRanks.length) {
        return {
          success: false,
          errors: [new Error(ErrorType.INVALID_INPUT)],
        };
      }

      try {
        const isTeacher = await hasTeacherRole(loaders, user.roleId);

        if (!isTeacher) {
          return {
            success: false,
            errors: [new Error(ErrorType.PERMISSION_DENIED)],
          };
        }

        await db.transaction(async (transaction) => {
          for (const component of componentRanks) {
            await transaction('content_component').where('id', component.id).update({
              rank: component.rank,
              updated_at: db.fn.now(),
            });

            loaders.ContentComponent.loaders.byIdLoader.clear(parseInt(component.id, 10));
          }
        });

        return {
          success: true,
          errors: [],
        };
      } catch (error) {
        console.log('Failed to update content component ranks: ', error);
        return {
          success: false,
          errors: [new Error(ErrorType.INTERNAL_SERVER_ERROR)],
        };
      }
    },
  ),
};

export default updateContentComponentRanks;
