import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql';

import ProgramLevel from '../types/enum/ProgramLevel';

const ProgramObjectiveInput = new GraphQLInputObjectType({
  name: 'ProgramObjectiveInput',
  description: 'Input for a program objective record.',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'A unique id of this program objective.',
    },
    objective: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The objective of this program.',
    },
  },
});

const ProgramRequirementInput = new GraphQLInputObjectType({
  name: 'ProgramRequirementInput',
  description: 'Input for a program requirement record.',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'A unique id of this program requirement.',
    },
    requirement: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The requirement of this program.',
    },
  },
});

const UpdateProgramInfoInput = new GraphQLInputObjectType({
  name: 'UpdateProgramInfoInput',
  description: 'Input for updating a program record.',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The ID of this program',
    },
    denomination: {
      type: GraphQLString,
      description: 'The denomination of this program',
    },
    slug: {
      type: GraphQLString,
      description: 'The slug of this program',
    },
    subtitle: {
      type: GraphQLString,
      description: 'The subtitle of this program',
    },
    description: {
      type: GraphQLString,
      description: 'The description of this program',
    },
    level: {
      type: ProgramLevel,
      description: 'The difficulty level of this program',
    },
    image: {
      type: GraphQLString,
      description: 'The image of this program',
    },
    is_published: {
      type: GraphQLBoolean,
      description: 'A flag to indicate whether this program is published or not',
    },
    subjectIds: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLID)),
      description: 'List of subject IDs to associate with the program',
    },
    objectives: {
      type: new GraphQLList(new GraphQLNonNull(ProgramObjectiveInput)),
      description: 'List of objectives for the program',
    },
    requirements: {
      type: new GraphQLList(new GraphQLNonNull(ProgramRequirementInput)),
      description: 'List of requirements for the program',
    },
  },
});

export default UpdateProgramInfoInput;
