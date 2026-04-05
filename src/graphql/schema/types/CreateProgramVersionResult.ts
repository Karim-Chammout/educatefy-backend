import { GraphQLObjectType } from 'graphql';

import { ProgramVersion as ProgramVersionType } from '../../../types/db-generated-types';
import { authenticated } from '../../utils/auth';
import { defaultMutationFields } from './MutationResult';
import { ProgramVersion } from './ProgramVersion';

type CreateProgramVersionResultType =
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

export const CreateProgramVersionResult = new GraphQLObjectType({
  name: 'CreateProgramVersionResult',
  description: 'The result of creating a new program version.',
  fields: {
    ...defaultMutationFields,
    programVersion: {
      type: ProgramVersion,
      description: 'The newly created draft program version.',
      resolve: authenticated(async (parent: CreateProgramVersionResultType, _, { loaders }) => {
        if (parent.success) {
          return loaders.ProgramVersion.loadById(parent.programVersion.id);
        }

        return null;
      }),
    },
  },
});
