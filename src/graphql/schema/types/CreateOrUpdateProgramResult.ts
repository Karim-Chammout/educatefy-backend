import { GraphQLObjectType } from 'graphql';

import { Program as ProgramType } from '../../../types/db-generated-types';
import { authenticated } from '../../utils/auth';
import { defaultMutationFields } from './MutationResult';
import { Program } from './Program';

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
