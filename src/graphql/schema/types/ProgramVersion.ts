import { GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType } from 'graphql';

import { ProgramVersion as ProgramVersionType } from '../../../types/db-generated-types';
import { ContextType } from '../../../types/types';
import { filterError } from '../../utils/filterError';
import { filterPublishedContent } from '../../utils/filterPublishedContent';
import GraphQLDate from '../Scalars/Date';
import { Course } from './Course';
import ProgramVersionStatus from './enum/ProgramVersionStatus';
import { ProgramVersionCourseEntry } from './ProgramVersionCourseEntry';

export const ProgramVersion: GraphQLObjectType = new GraphQLObjectType<
  ProgramVersionType,
  ContextType
>({
  name: 'ProgramVersion',
  description: "A versioned snapshot of a program's course list.",
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'A unique id of this program version.',
    },
    program_id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The ID of the program this version belongs to.',
    },
    version_number: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The sequential version number of this program version.',
    },
    status: {
      type: new GraphQLNonNull(ProgramVersionStatus),
      description: 'The lifecycle status of this program version.',
    },
    published_at: {
      type: GraphQLDate,
      description: 'The date this version was published. Null if not yet published.',
    },
    created_at: {
      type: new GraphQLNonNull(GraphQLDate),
      description: 'The date this program version was created.',
    },
    updated_at: {
      type: new GraphQLNonNull(GraphQLDate),
      description: 'The date this program version was last updated.',
    },
    courses: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Course))),
      description: 'The ordered list of courses in this program version.',
      resolve: async (parent, _, { loaders }) => {
        const courseProgramVersionLinks = await loaders.CourseProgramVersion.loadByProgramVersionId(
          parent.id,
        );

        if (!courseProgramVersionLinks || courseProgramVersionLinks.length === 0) {
          return [];
        }

        const sortedCourseIds = [...courseProgramVersionLinks]
          .sort((a, b) => a.rank - b.rank)
          .map((link) => link.course_id);

        const courses = await filterError(loaders.Course.loadManyByIds(sortedCourseIds));

        if (!courses || courses.length === 0) {
          return [];
        }

        return filterPublishedContent(courses);
      },
    },
    courseEntries: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ProgramVersionCourseEntry))),
      description:
        'The ordered list of course entries in this program version, including rank and prerequisite metadata.',
      resolve: async (parent, _, { loaders }) => {
        const links = await loaders.CourseProgramVersion.loadByProgramVersionId(parent.id);

        if (!links || links.length === 0) {
          return [];
        }

        return [...links].sort((a, b) => a.rank - b.rank);
      },
    },
  }),
});
