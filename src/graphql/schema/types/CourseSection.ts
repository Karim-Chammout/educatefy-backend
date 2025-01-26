import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

import {
  CourseSectionItemContentTypeEnumType,
  CourseSection as CourseSectionType,
} from '../../../types/db-generated-types';
import { ContextType } from '../../../types/types';
import { CourseSectionItem } from './union/CourseSectionItem';

export const CourseSection = new GraphQLObjectType<CourseSectionType, ContextType>({
  name: 'CourseSection',
  description: 'The course section info',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'A unique id of this course section.',
    },
    denomination: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The denomination of this course section',
    },
    is_published: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'A flag to indicate whether this course section is published or not',
    },
    rank: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The rank of this course section',
    },
    items: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(CourseSectionItem))),
      description: 'The course section items',
      resolve: async (parent, _, { loaders }) => {
        const courseSectionItems = await loaders.CourseSectionItem.loadByCourseSectionId(parent.id);

        const sectionItems = await Promise.all(
          courseSectionItems.map(async ({ id, content_id, content_type, rank }) => {
            const courseSectionItemValuesToInject = {
              itemId: id,
              content_type,
              rank,
            };

            switch (content_type) {
              case CourseSectionItemContentTypeEnumType.Lesson:
                const lesson = await loaders.Lesson.loadById(content_id);

                if (!lesson || !lesson.is_published) {
                  return null;
                }

                return { ...lesson, ...courseSectionItemValuesToInject };
              default:
                return null;
            }
          }),
        );

        if (sectionItems.length === 0) {
          return [];
        }

        const items = sectionItems.filter((item) => item !== null).sort((a, b) => a.rank - b.rank);

        return items;
      },
    },
  },
});
