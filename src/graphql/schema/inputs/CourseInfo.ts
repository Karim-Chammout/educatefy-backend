import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql';

import GraphQLDate from '../Scalars/Date';
import CourseLevel from '../types/enum/CourseLevel';

const CourseInfoInput = new GraphQLInputObjectType({
  name: 'CourseInfoInput',
  description: 'Input for creating a course record.',
  fields: {
    denomination: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The denomination of this course.',
    },
    slug: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The slug of this course.',
    },
    subtitle: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The subtitle of this course.',
    },
    description: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The description of this course.',
    },
    language: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The language of this course.',
    },
    level: {
      type: new GraphQLNonNull(CourseLevel),
      description: 'The difficulty level of this course.',
    },
    image: {
      type: GraphQLString,
      description: 'The image of this course.',
    },
    external_resource_link: {
      type: GraphQLString,
      description: 'A link to an external resource.',
    },
    is_published: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'A flag to indicate whether this course is published or not.',
    },
    start_date: {
      type: GraphQLDate,
      description: 'The start date of the course.',
    },
    end_date: {
      type: GraphQLDate,
      description: 'The end date of the course.',
    },
    subjectIds: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLID)),
      description: 'List of subject IDs to associate with the course',
    },
    objectives: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLString)),
      description: 'List of objectives for the course',
    },
    requirements: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLString)),
      description: 'List of requirements for the course',
    },
  },
});

export default CourseInfoInput;
