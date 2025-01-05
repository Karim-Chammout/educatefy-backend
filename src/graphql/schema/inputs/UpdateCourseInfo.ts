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

const CourseObjectiveInput = new GraphQLInputObjectType({
  name: 'CourseObjectiveInput',
  description: 'Input for a course objective record.',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'A unique id of this course objective.',
    },
    objective: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The objective of this course.',
    },
  },
});

const CourseRequirementInput = new GraphQLInputObjectType({
  name: 'CourseRequirementInput',
  description: 'Input for a course requirement record.',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'A unique id of this course requirement.',
    },
    requirement: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The requirement of this course.',
    },
  },
});

const UpdateCourseInfoInput = new GraphQLInputObjectType({
  name: 'UpdateCourseInfoInput',
  description: 'Input for updating a course record.',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The ID of this course',
    },
    denomination: {
      type: GraphQLString,
      description: 'The denomination of this course',
    },
    slug: {
      type: GraphQLString,
      description: 'The slug of this course',
    },
    subtitle: {
      type: GraphQLString,
      description: 'The subtitle of this course',
    },
    description: {
      type: GraphQLString,
      description: 'The description of this course',
    },
    language: {
      type: GraphQLString,
      description: 'The language of this course.',
    },
    level: {
      type: CourseLevel,
      description: 'The difficulty level of this course',
    },
    image: {
      type: GraphQLString,
      description: 'The image of this course',
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
      type: GraphQLBoolean,
      description: 'A flag to indicate whether this course is published or not',
    },
    start_date: {
      type: GraphQLDate,
      description: 'The start date of the course',
    },
    end_date: {
      type: GraphQLDate,
      description: 'The end date of the course',
    },
    subjectIds: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLID)),
      description: 'List of subject IDs to associate with the course',
    },
    objectives: {
      type: new GraphQLList(new GraphQLNonNull(CourseObjectiveInput)),
      description: 'List of objectives for the course',
    },
    requirements: {
      type: new GraphQLList(new GraphQLNonNull(CourseRequirementInput)),
      description: 'List of requirements for the course',
    },
  },
});

export default UpdateCourseInfoInput;
