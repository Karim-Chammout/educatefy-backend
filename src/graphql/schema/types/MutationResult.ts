import {
  GraphQLBoolean,
  GraphQLFieldConfigMap,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
} from 'graphql';

import { ContextType } from '../../../types/types';
import Error from './Error';

type MutationResultType =
  | {
      success: true;
      errors: [];
    }
  | {
      success: false;
      errors: Error[];
    };

export const defaultMutationFields: GraphQLFieldConfigMap<any, ContextType> = {
  success: {
    type: new GraphQLNonNull(GraphQLBoolean),
    description: 'Indicates if the mutation was successful.',
  },
  errors: {
    type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Error))),
    description: 'A list of errors that occurred executing this mutation.',
    resolve(parent: MutationResultType) {
      if (parent.success === true) {
        return [];
      }

      return parent.errors.map((error) => ({
        message: error.message,
      }));
    },
  },
};

const MutationResult = new GraphQLObjectType({
  name: 'MutationResult',
  description: 'The result of a mutation.',
  fields: {
    ...defaultMutationFields,
  },
});

export default MutationResult;
