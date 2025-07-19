import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

import { CourseRating as CourseReviewType } from '../../../types/db-generated-types';
import { ContextType } from '../../../types/types';
import GraphQLDate from '../Scalars/Date';
import { PublicAccount } from './PublicAccount';

export const CourseReview = new GraphQLObjectType<CourseReviewType, ContextType>({
  name: 'CourseReview',
  description: 'The review details of a course',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'Id of this course review',
    },
    rating: {
      type: GraphQLFloat,
      description: '1-5 star rating value given by the reviewer',
    },
    review: {
      type: GraphQLString,
      description: 'The review text given by the reviewer',
    },
    reviewer: {
      type: new GraphQLNonNull(PublicAccount),
      description: 'The reviewer who wrote the review',
      resolve: (parent, _, { loaders }) => loaders.Account.loadById(parent.account_id),
    },
    isEditable: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'Whether the review can be edited by the user',
      resolve: (parent, _, { user }) =>
        user.authenticated && parent.account_id === user.id ? true : false,
    },
    created_at: {
      type: new GraphQLNonNull(GraphQLDate),
      description: 'The date when the review was created',
    },
  },
});
