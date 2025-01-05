import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

import { Course as CourseType } from '../../../types/db-generated-types';
import { ContextType } from '../../../types/types';
import { getImageURL } from '../../../utils/getImageURL';
import GraphQLDate from '../Scalars/Date';
import { CourseObjective } from './CourseObjective';
import CourseLevel from './enum/CourseLevel';
import { Subject } from './Subject';

export const Course: GraphQLObjectType = new GraphQLObjectType<CourseType, ContextType>({
  name: 'Course',
  description: 'The course info.',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'A unique id of this course.',
    },
    denomination: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The denomination of this course.',
    },
    slug: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'A unique slug of this course.',
    },
    subtitle: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The subtitle of this course.',
    },
    description: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The description of this course.',
    },
    level: {
      type: new GraphQLNonNull(CourseLevel),
      description: 'The difficulty level of this course.',
    },
    external_resource_link: {
      type: GraphQLString,
      description: 'A link to an external resource.',
    },
    external_meeting_link: {
      type: GraphQLString,
      description: 'A link to an external meeting.',
    },
    is_published: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'A flag to indicate whether this course is published or not',
    },
    image: {
      type: GraphQLString,
      description: 'The image of this course',
      resolve: async (parent) => {
        return parent.image ? getImageURL(parent.image) : null;
      },
    },
    language: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The language of this course',
      resolve: async (parent, _, { loaders }) => {
        const language = await loaders.Language.loadById(parent.language_id);

        return language.denomination;
      },
    },
    start_date: {
      type: GraphQLDate,
      description: 'The start date of the course',
    },
    end_date: {
      type: GraphQLDate,
      description: 'The end date of the course',
    },
    created_at: {
      type: new GraphQLNonNull(GraphQLDate),
      description: 'The date of when this course was created.',
    },
    updated_at: {
      type: new GraphQLNonNull(GraphQLDate),
      description: 'The date of when this course was last updated.',
    },
    subjects: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Subject))),
      description: 'The subjects linked to this course.',
      resolve: async (parent, _, { loaders }) => {
        const subjects = await loaders.Subject.loadByCourseId(parent.id);

        if (!subjects || subjects.length === 0) {
          return [];
        }

        return subjects;
      },
    },
    objectives: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(CourseObjective))),
      description: 'The objectives of this course.',
      resolve: async (parent, _, { loaders }) => {
        const courseObjectives = await loaders.CourseObjective.loadByCourseId(parent.id);

        if (!courseObjectives || courseObjectives.length === 0) {
          return [];
        }

        return courseObjectives;
      },
    },
  }),
});
