import { GraphQLObjectType } from 'graphql';

import { Program as ProgramType } from '../../../types/db-generated-types.js';
import { authenticated } from '../../utils/auth.js';
import { Program } from './Program.js';
import { defaultMutationFields } from './MutationResult.js';

type MutationResultType =
  | {
      success: true;
      errors: [];
      program: ProgramType;
    }
  | {
      success: false;
      errors: Error[];
      program: null;
    };

export const UpdateProgramStatusResult = new GraphQLObjectType({
  name: 'UpdateProgramStatusResult',
  description: 'The result of the enrolling or unenrolling from a program.',
  fields: {
    ...defaultMutationFields,
    program: {
      type: Program,
      description: 'The updated course information.',
      resolve: authenticated(async (parent: MutationResultType, _, { loaders }) => {
        if (parent.success) {
          const program = await loaders.Program.loadById(parent.program.id);

          return program;
        }

        return null;
      }),
    },
  },
});
