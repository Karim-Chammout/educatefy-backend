import { GraphQLEnumType } from 'graphql';

const Gender = new GraphQLEnumType({
  name: 'Gender',
  description: 'Gender of the account.',
  values: {
    male: {
      value: 'male',
    },
    female: {
      value: 'female',
    },
    unknown: {
      value: 'unknown',
    },
  },
});

export default Gender;
