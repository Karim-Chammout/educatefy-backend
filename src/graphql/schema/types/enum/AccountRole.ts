import { GraphQLEnumType } from 'graphql';

export enum AccountRoleEnum {
  Teacher = 'teacher',
  Student = 'student',
}

const AccountRole = new GraphQLEnumType({
  name: 'AccountRole',
  description: 'The role of the account.',
  values: {
    teacher: {
      value: 'teacher',
    },
    student: {
      value: 'student',
    },
  },
});

export default AccountRole;
