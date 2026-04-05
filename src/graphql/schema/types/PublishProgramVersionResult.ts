import { GraphQLObjectType } from 'graphql';

import { ProgramVersion as ProgramVersionType } from '../../../types/db-generated-types';
import { authenticated } from '../../utils/auth';
import { defaultMutationFields } from './MutationResult';
import { ProgramVersion } from './ProgramVersion';

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
