import { GraphQLBoolean, GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLObjectType } from 'graphql';

import { ContextType } from '../../../types/types';
import GraphQLDate from '../Scalars/Date';

export const ContentComponentProgress = new GraphQLObjectType<any, ContextType>({
  name: 'ContentComponentProgress',
  description: 'Progress tracking for content components',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The unique identifier of the progress record',
    },
    content_component_id: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The content component ID',
    },
    is_completed: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'Flag to indicate if the content component is completed',
    },
    completed_at: {
      type: GraphQLDate,
      description: 'When the component was completed',
    },
  }),
});
