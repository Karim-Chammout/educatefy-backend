import { GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';

import { Subject as SubjectType } from '../../../types/db-generated-types.js';
import { ContextType } from '../../../types/types.js';
import { filterProgramsWithValidVersions } from '../../utils/contentUtils.js';
import { filterPublishedContent } from '../../utils/filterPublishedContent.js';
import { Course } from './Course.js';
import { Program } from './Program.js';

export const Subject = new GraphQLObjectType<SubjectType, ContextType>({
  name: 'Subject',
  description: 'The subject info',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'A unique id of this subject.',
    },
    denomination: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The name of this subject.',
    },
    courses: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Course))),
      description: 'The courses linked to this subject.',
      resolve: async (parent, _, { loaders }) => {
        const courses = await loaders.Course.loadBySubjectId(parent.id);

        if (!courses || courses.length === 0) {
          return [];
        }

        return filterPublishedContent(courses);
      },
    },
    programs: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Program))),
      description: 'The programs linked to this subject.',
      resolve: async (parent, _, { loaders, user }) => {
        const programs = await loaders.Program.loadBySubjectId(parent.id);

        if (!programs || programs.length === 0) {
          return [];
        }

        const filteredPrograms = await filterProgramsWithValidVersions(programs, user, loaders);

        if (filteredPrograms.length === 0) {
          return [];
        }

        return filterPublishedContent(filteredPrograms);
      },
    },
  },
});
