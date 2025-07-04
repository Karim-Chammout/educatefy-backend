import {
  GraphQLBoolean,
  GraphQLFieldConfigMap,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql';

import { ContentComponent as ContentComponentType } from '../../../types/db-generated-types';
import { ContextType } from '../../../types/types';
import { ContentComponentProgress } from './ContentComponentProgress';
import { ComponentType } from './enum/ContentComponent';

export const defaultContentComponentFields: GraphQLFieldConfigMap<
  ContentComponentType & { component_id: number },
  ContextType
> = {
  denomination: {
    type: new GraphQLNonNull(GraphQLString),
    description: 'The denomination of the component.',
  },
  type: {
    type: new GraphQLNonNull(ComponentType),
    description: 'The type of the component.',
  },
  is_required: {
    type: new GraphQLNonNull(GraphQLBoolean),
    description: 'A flag indicating whether the component is required to continue.',
  },
  is_published: {
    type: new GraphQLNonNull(GraphQLBoolean),
    description: 'A flag indicating whether the component is published',
  },
  rank: {
    type: new GraphQLNonNull(GraphQLInt),
    description: 'The rank of the component',
  },
  progress: {
    type: ContentComponentProgress,
    description: 'The progress of this component for the current user',
    resolve: async (parent, _, { loaders, user }) => {
      if (!user.authenticated) {
        return null;
      }

      const contentComponentProgress =
        await loaders.ContentComponentProgress.loadByAccountIdAndComponentId(
          user.id,
          parent.component_id,
        );

      if (!contentComponentProgress) {
        return null;
      }

      return contentComponentProgress;
    },
  },
};
