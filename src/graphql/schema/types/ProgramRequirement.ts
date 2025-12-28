import { GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';

import { ProgramRequirement as ProgramRequirementType } from '../../../types/db-generated-types';
import { ContextType } from '../../../types/types';

export const ProgramRequirement = new GraphQLObjectType<ProgramRequirementType, ContextType>({
  name: 'ProgramRequirement',
  description: 'The program requirement info',
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
