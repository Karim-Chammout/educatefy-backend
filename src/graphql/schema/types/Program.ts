import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

import { Program as ProgramType } from '../../../types/db-generated-types';
import { ContextType } from '../../../types/types';
import { getImageURL } from '../../../utils/getImageURL';
import { filterError } from '../../utils/filterError';
import { filterPublishedContent } from '../../utils/filterPublishedContent';
import GraphQLDate from '../Scalars/Date';
import { Course } from './Course';
import ProgramLevel from './enum/ProgramLevel';
import { ProgramObjective } from './ProgramObjective';
import { ProgramRequirement } from './ProgramRequirement';
import { Subject } from './Subject';
import { Teacher } from './Teacher';

export const Program: GraphQLObjectType = new GraphQLObjectType<ProgramType, ContextType>({
  name: 'Program',
  description: 'The program info.',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'A unique id of this program.',
    },
    denomination: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The denomination of this program.',
    },
    slug: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'A unique slug of this program.',
    },
    subtitle: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The subtitle of this program.',
    },
    description: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The description of this program.',
    },
    level: {
      type: new GraphQLNonNull(ProgramLevel),
      description: 'The difficulty level of this program.',
    },
    external_resource_link: {
      type: GraphQLString,
      description: 'A link to an external resource.',
    },
    is_published: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'A flag to indicate whether this program is published or not',
    },
    image: {
      type: GraphQLString,
      description: 'The image of this program',
      resolve: async (parent) => {
        return parent.image ? getImageURL(parent.image) : null;
      },
    },
    created_at: {
      type: new GraphQLNonNull(GraphQLDate),
      description: 'The date of when this program was created.',
    },
    updated_at: {
      type: new GraphQLNonNull(GraphQLDate),
      description: 'The date of when this program was last updated.',
    },
    subjects: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Subject))),
      description: 'The subjects linked to this program.',
      resolve: async (parent, _, { loaders }) => {
        const subjects = await loaders.Subject.loadByProgramId(parent.id);

        if (!subjects || subjects.length === 0) {
          return [];
        }

        return subjects;
      },
    },
    objectives: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ProgramObjective))),
      description: 'The objectives of this program.',
      resolve: async (parent, _, { loaders }) => {
        const programObjectives = await loaders.ProgramObjective.loadByProgramId(parent.id);

        if (!programObjectives || programObjectives.length === 0) {
          return [];
        }

        return programObjectives;
      },
    },
    requirements: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ProgramRequirement))),
      description: 'The requirements of this program.',
      resolve: async (parent, _, { loaders }) => {
        const programRequirements = await loaders.ProgramRequirement.loadByProgramId(parent.id);

        if (!programRequirements || programRequirements.length === 0) {
          return [];
        }

        return programRequirements;
      },
    },
    enrolledLearnersCount: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'Number of learners enrolled in this program.',
      resolve: async (parent, _, { loaders }) => {
        const programEnrollments = await loaders.AccountProgram.loadByProgramId(parent.id);

        return programEnrollments.length;
      },
    },
    rating: {
      type: new GraphQLNonNull(GraphQLFloat),
      description: 'Average rating across all courses in this program',
      resolve: async (parent, _, { db }) => {
        const result = await db('course__program')
          .join('course_rating', 'course__program.course_id', 'course_rating.course_id')
          .where('course__program.program_id', parent.id)
          .avg('course_rating.rating as average')
          .first();

        if (!result || result.average === null) {
          return 0;
        }

        return parseFloat(result.average);
      },
    },
    ratingsCount: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'Total number of course ratings in this program',
      resolve: async (parent, _, { db }) => {
        const result = await db('course__program')
          .join('course_rating', 'course__program.course_id', 'course_rating.course_id')
          .where('course__program.program_id', parent.id)
          .count('course_rating.id as count')
          .first();

        if (!result || result.count === 0) {
          return 0;
        }

        return parseInt(String(result.count));
      },
    },
    instructor: {
      type: new GraphQLNonNull(Teacher),
      description: 'The name of the instructor for this program',
      resolve: async (parent, _, { loaders }) => {
        const instructor = await loaders.Account.loadById(parent.teacher_id);

        return instructor;
      },
    },
    courses: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Course))),
      description: 'The courses linked to this program.',
      resolve: async (parent, _, { loaders }) => {
        const courseProgramRelations = await loaders.CourseProgram.loadByProgramId(parent.id);

        if (!courseProgramRelations || courseProgramRelations.length === 0) {
          return [];
        }

        const courseIds = courseProgramRelations.map((relation) => relation.course_id);

        const courses = await filterError(loaders.Course.loadManyByIds(courseIds));

        if (!courses || courses.length === 0) {
          return [];
        }

        return filterPublishedContent(courses);
      },
    },
  }),
});
