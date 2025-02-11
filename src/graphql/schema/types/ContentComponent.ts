import {
  GraphQLBoolean,
  GraphQLFieldConfigMap,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql';

import { ContentComponent as ContentComponentType } from '../../../types/db-generated-types';
import { ContextType } from '../../../types/types';
import { ComponentType } from './enum/ContentComponent';

export const defaultContentComponentFields: GraphQLFieldConfigMap<
  ContentComponentType,
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
};
