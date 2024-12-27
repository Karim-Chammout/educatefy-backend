import {
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql';

import Date from '../Scalars/Date';
import Gender from '../types/enum/Gender';

const ProfileDetailsInput = new GraphQLInputObjectType({
  name: 'ProfileDetailsInput',
  description: 'Input for updating the user profile details',
  fields: {
    firstName: {
      type: GraphQLString,
      description: 'The first name of the user.',
    },
    lastName: {
      type: GraphQLString,
      description: 'The last name of the user.',
    },
    nickname: {
      type: GraphQLString,
      description: 'The nickname name of the user.',
    },
    nationalityId: {
      type: GraphQLID,
      description: 'The nationality of the user',
    },
    countryId: {
      type: GraphQLID,
      description: 'The current country of the user',
    },
    selectedLanguage: {
      type: GraphQLString,
      description: 'The preferred language for the user',
    },
    gender: {
      type: Gender,
      description: 'The gender of the user.',
    },
    dateOfBirth: {
      type: Date,
      description: 'The date of birth of the user.',
    },
    teacherSpecialties: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLID)),
      description: 'List of subject IDs a teacher is specialized in for teaching.',
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

export default ProfileDetailsInput;
