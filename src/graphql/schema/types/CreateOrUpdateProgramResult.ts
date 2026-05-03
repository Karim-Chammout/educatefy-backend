import { GraphQLObjectType } from 'graphql';

import { Program as ProgramType } from '../../../types/db-generated-types.js';
import { authenticated } from '../../utils/auth.js';
import { defaultMutationFields } from './MutationResult.js';
import { Program } from './Program.js';

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

export const CreateOrUpdateProgramResult = new GraphQLObjectType({
  name: 'CreateOrUpdateProgramResult',
  description: 'The result of the creating or updating a program.',
  fields: {
    ...defaultMutationFields,
    program: {
      type: Program,
      description: 'The created or updated program information.',
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
