import { GraphQLObjectType } from 'graphql';

import { Program as ProgramType } from '../../../types/db-generated-types';
import { authenticated } from '../../utils/auth';
import { defaultMutationFields } from './MutationResult';
import { Program } from './Program';

type UpgradeToLatestProgramVersionResultType =
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

export const UpgradeToLatestProgramVersionResult = new GraphQLObjectType({
  name: 'UpgradeToLatestProgramVersionResult',
  description: 'The result of upgrading a student to the latest published program version.',
  fields: {
    ...defaultMutationFields,
    program: {
      type: Program,
      description: 'The program after the version upgrade.',
      resolve: authenticated(
        async (parent: UpgradeToLatestProgramVersionResultType, _, { loaders }) => {
          if (parent.success) {
            return loaders.Program.loadById(parent.program.id);
          }
          return null;
        },
      ),
    },
  },
});
