import { GraphQLBoolean, GraphQLObjectType } from 'graphql';

import { defaultMutationFields } from './MutationResult.js';
import { ContentComponentProgress } from './ContentComponentProgress.js';
import { authenticated } from '../../utils/auth.js';
import { ContentComponentProgress as ContentComponentProgressType } from '../../../types/db-generated-types.js';

type MutationResultType =
  | {
      success: true;
      errors: [];
      contentComponentProgress: ContentComponentProgressType;
      courseCompleted?: boolean;
    }
  | {
      success: false;
      errors: Error[];
      contentComponentProgress: null;
      courseCompleted?: boolean;
    };

export const ContentComponentProgressResult = new GraphQLObjectType({
  name: 'ContentComponentProgressResult',
  description: 'Result of updating content component progress',
  fields: {
    ...defaultMutationFields,
    contentComponentProgress: {
      type: ContentComponentProgress,
      description: 'The updated content component progress.',
      resolve: authenticated(async (parent: MutationResultType, _, { loaders }) => {
        if (parent.success) {
          const contentComponentProgress = await loaders.ContentComponentProgress.loadById(
            parent.contentComponentProgress.id,
          );

          return contentComponentProgress;
        }

        return null;
      }),
    },
    courseCompleted: {
      type: GraphQLBoolean,
      description:
        'True when this progress update caused the course to be auto-completed (so the frontend can show the completion success flow).',
      resolve: (parent: MutationResultType) => parent.courseCompleted ?? false,
    },
  },
});
