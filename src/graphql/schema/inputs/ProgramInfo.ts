import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql';

import ProgramLevel from '../types/enum/ProgramLevel';

const ProgramInfoInput = new GraphQLInputObjectType({
  name: 'ProgramInfoInput',
  description: 'Input for creating a program record.',
  fields: {
    denomination: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The denomination of this program.',
    },
    slug: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The slug of this program.',
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
    image: {
      type: GraphQLString,
      description: 'The image of this program.',
    },
    is_published: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'A flag to indicate whether this program is published or not.',
    },
    subjectIds: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLID)),
      description: 'List of subject IDs to associate with the program',
    },
    objectives: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLString)),
      description: 'List of objectives for the program',
    },
    requirements: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLString)),
      description: 'List of requirements for the program',
    },
  },
});

export default ProgramInfoInput;
