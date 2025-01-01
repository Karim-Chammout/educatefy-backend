import {
  GraphQLError,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

import { ContextType } from '../../types/types';
import { ErrorType } from '../../utils/ErrorType';
import { authenticated } from '../utils/auth';
import { Account } from './types/Account';
import { Country } from './types/Country';
import { Course } from './types/Course';
import { AccountRoleEnum } from './types/enum/AccountRole';
import { Language } from './types/Language';
import { OpenidClient } from './types/OpenidClient';
import { Subject } from './types/Subject';

const Query = new GraphQLObjectType<any, ContextType>({
  name: 'Query',
  fields: {
    me: {
      type: new GraphQLNonNull(Account),
      description: 'The current user',
      resolve: authenticated((_, __, ctx) => {
        return ctx.loaders.Account.loadById(ctx.user.id);
      }),
    },
    countries: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Country))),
      description: 'List of countries',
      resolve: async (_, __, ctx) => {
        const countries = await ctx.loaders.Country.loadAll();

        if (!countries || countries.length === 0) {
          return [];
        }

        return countries;
      },
    },
    subjects: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Subject))),
      description: 'List of subjects',
      resolve: async (_, __, ctx) => {
        const subjects = await ctx.loaders.Subject.loadAll();

        if (!subjects || subjects.length === 0) {
          return [];
        }

        return subjects;
      },
    },
    subject: {
      type: Subject,
      description: 'Retrieve a subject by its id',
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLID),
          description: 'The id of the subject.',
        },
      },
      resolve: async (_, { id }: { id: string }, ctx) => {
        const subjectId = parseInt(id, 10);
        const subject = await ctx.loaders.Subject.loadById(subjectId);

        if (!subject) {
          return null;
        }

        return subject;
      },
    },
    openIdClients: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(OpenidClient))),
      description: 'List of OpenId clients',
      resolve: async (_, __, { loaders }) => {
        const oidc = await loaders.OpenidClient.loadAll();

        if (!oidc || oidc.length === 0) {
          return [];
        }

        return oidc;
      },
    },
    languages: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Language))),
      description: 'List of languages',
      resolve: async (_, __, { loaders }) => {
        const languages = await loaders.Language.loadAll();

        if (!languages || languages.length === 0) {
          return [];
        }

        return languages;
      },
    },
    course: {
      type: Course,
      description: 'Retrieve a course by its slug',
      args: {
        slug: {
          type: new GraphQLNonNull(GraphQLString),
          description: 'The slug of the course.',
        },
      },
      resolve: async (_, { slug }: { slug: string }, { loaders }) => {
        const course = await loaders.Course.loadBySlug(slug);

        if (!course || !course.is_published) {
          return null;
        }

        return course;
      },
    },
    teacherCourses: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Course))),
      description: 'List of courses created by the teacher',
      resolve: authenticated(async (_, __, { loaders, user }) => {
        const accountRole = await loaders.AccountRole.loadById(user.roleId);

        if (accountRole.code !== AccountRoleEnum.Teacher) {
          throw new GraphQLError(ErrorType.FORBIDDEN);
        }

        const courses = await loaders.Course.loadByTeacherId(user.id);

        if (!courses) {
          return [];
        }

        return courses;
      }),
    },
    editableCourse: {
      type: Course,
      description: 'Retrieve a course to be edited by the teacher.',
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLID),
          description: 'The id of the course.',
        },
      },
      resolve: authenticated(async (_, { id }: { id: string }, { loaders, user }) => {
        const courseId = parseInt(id, 10);

        const accountRole = await loaders.AccountRole.loadById(user.roleId);

        if (accountRole.code !== AccountRoleEnum.Teacher) {
          throw new GraphQLError(ErrorType.FORBIDDEN);
        }

        const course = await loaders.Course.loadById(courseId);

        if (!course || course.teacher_id !== user.id) {
          return null;
        }

        return course;
      }),
    },
    subjectsListWithLinkedCourses: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Subject))),
      description: 'List of subjects that have courses associated with them',
      resolve: async (_, __, { loaders }) => {
        const subjects = await loaders.Subject.loadSubjectsWithLinkedCourses();

        if (!subjects || subjects.length === 0) {
          return [];
        }

        return subjects;
      },
    },
  },
});

export default Query;
