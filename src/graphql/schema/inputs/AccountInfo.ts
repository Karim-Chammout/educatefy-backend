import { GraphQLID, GraphQLInputObjectType, GraphQLNonNull, GraphQLString } from 'graphql';

import GraphQLDate from '../Scalars/Date';
import Gender from '../types/enum/Gender';

const AccountInfoInput = new GraphQLInputObjectType({
  name: 'AccountInfoInput',
  description: 'Input for updating an account information',
  fields: {
    selectedLanguage: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The preferred language for the user.',
    },
    firstName: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The first name of the user.',
    },
    lastName: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The last name of the user.',
    },
    nickname: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The nickname name of the user.',
    },
    nationalityId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The nationality of the user',
    },
    countryId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The current country of the user',
    },
    gender: {
      type: new GraphQLNonNull(Gender),
      description: 'The gender of the user.',
    },
    dateOfBirth: {
      type: new GraphQLNonNull(GraphQLDate),
      description: 'The date of birth of the user.',
    },
    teacherSpecialty: {
      type: GraphQLString,
      description: 'The specialty of the teacher.',
    },
    teacherBio: {
      type: GraphQLString,
      description: 'The short bio about the teacher.',
    },
    teacherDescription: {
      type: GraphQLString,
      description: 'The short description about the teacher.',
    },
  },
});

export default AccountInfoInput;
