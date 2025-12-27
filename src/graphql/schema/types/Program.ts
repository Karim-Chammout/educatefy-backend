import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

import { Program as ProgramType } from '../../../types/db-generated-types';
import { ContextType } from '../../../types/types';
import { getImageURL } from '../../../utils/getImageURL';
import GraphQLDate from '../Scalars/Date';
import ProgramLevel from './enum/ProgramLevel';

export const Program: GraphQLObjectType = new GraphQLObjectType<ProgramType, ContextType>({
  name: 'Program',
  description: 'The program info.',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'A unique id of this program.',
    },
    denomination: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The denomination of this program.',
    },
    slug: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'A unique slug of this program.',
    },
    subtitle: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The subtitle of this program.',
    },
    description: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The description of this program.',
    },
    level: {
      type: new GraphQLNonNull(ProgramLevel),
      description: 'The difficulty level of this program.',
    },
    external_resource_link: {
      type: GraphQLString,
      description: 'A link to an external resource.',
    },
    is_published: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'A flag to indicate whether this program is published or not',
    },
    image: {
      type: GraphQLString,
      description: 'The image of this program',
      resolve: async (parent) => {
        return parent.image ? getImageURL(parent.image) : null;
      },
    },
    created_at: {
      type: new GraphQLNonNull(GraphQLDate),
      description: 'The date of when this program was created.',
    },
    updated_at: {
      type: new GraphQLNonNull(GraphQLDate),
      description: 'The date of when this program was last updated.',
    },
  }),
});
