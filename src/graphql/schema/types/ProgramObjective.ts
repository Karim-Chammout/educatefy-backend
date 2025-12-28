import { GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';

import { ProgramObjective as ProgramObjectiveType } from '../../../types/db-generated-types';
import { ContextType } from '../../../types/types';

export const ProgramObjective = new GraphQLObjectType<ProgramObjectiveType, ContextType>({
  name: 'ProgramObjective',
  description: 'The program objective info',
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
