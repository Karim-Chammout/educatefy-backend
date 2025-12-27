import { GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';

import { Subject as SubjectType } from '../../../types/db-generated-types';
import { ContextType } from '../../../types/types';
import { filterPublishedContent } from '../../utils/filterPublishedContent';
import { Course } from './Course';

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
  },
});
