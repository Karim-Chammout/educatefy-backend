import { GraphQLObjectType } from 'graphql';

import { ProgramVersion as ProgramVersionType } from '../../../types/db-generated-types.js';
import { authenticated } from '../../utils/auth.js';
import { defaultMutationFields } from './MutationResult.js';
import { ProgramVersion } from './ProgramVersion.js';

type PublishProgramVersionResultType =
  | {
      success: true;
      errors: [];
      programVersion: ProgramVersionType;
    }
  | {
      success: false;
      errors: Error[];
      programVersion: null;
    };

export const PublishProgramVersionResult = new GraphQLObjectType({
  name: 'PublishProgramVersionResult',
  description: 'The result of publishing a program version.',
  fields: {
    ...defaultMutationFields,
    programVersion: {
      type: ProgramVersion,
      description: 'The newly published program version.',
      resolve: authenticated(async (parent: PublishProgramVersionResultType, _, { loaders }) => {
        if (parent.success) {
          return loaders.ProgramVersion.loadById(parent.programVersion.id);
        }

        return null;
      }),
    },
  },
});
