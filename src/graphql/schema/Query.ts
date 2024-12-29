import { GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';

import { ContextType } from '../../types/types';
import { authenticated } from '../utils/auth';
import { Account } from './types/Account';
import { Country } from './types/Country';
import { Course } from './types/Course';
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
  },
});

export default Query;
