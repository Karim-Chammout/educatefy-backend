import { GraphQLObjectType } from 'graphql';

import { ProgramVersion as ProgramVersionType } from '../../../types/db-generated-types.js';
import { authenticated } from '../../utils/auth.js';
import { defaultMutationFields } from './MutationResult.js';
import { ProgramVersion } from './ProgramVersion.js';

type UpdateProgramVersionCoursesResultType =
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

export const UpdateProgramVersionCoursesResult = new GraphQLObjectType({
  name: 'UpdateProgramVersionCoursesResult',
  description: 'The result of updating the courses in a program version.',
  fields: {
    ...defaultMutationFields,
    programVersion: {
      type: ProgramVersion,
      description: 'The updated program version.',
      resolve: authenticated(
        async (parent: UpdateProgramVersionCoursesResultType, _, { loaders }) => {
          if (parent.success) {
            return loaders.ProgramVersion.loadById(parent.programVersion.id);
          }

          return null;
        },
      ),
    },
  },
});
