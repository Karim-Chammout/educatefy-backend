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
  ContentComponentTypeEnumType,
  Lesson as LessonType,
} from '../../../types/db-generated-types';
import { ContextType } from '../../../types/types';
import { ContentComponent } from './union/ContentComponent';

export const Lesson = new GraphQLObjectType<LessonType, ContextType>({
  name: 'Lesson',
  description: 'The lesson info',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'A unique id of this lesson.',
    },
    itemId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The ID of the section item this lesson belongs to.',
    },
    denomination: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The denomination of this lesson.',
    },
    duration: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The duration of this lesson.',
    },
    is_published: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'A flag to indicate whether this lesson is published or not',
    },
    components: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ContentComponent))),
      description: 'The content components of this lesson.',
      resolve: async (parent, _, { loaders }) => {
        const contentComponents = await loaders.ContentComponent.loadByParentIdAndParentType(
          parent.id,
          'lesson',
        );

        if (!contentComponents || contentComponents.length === 0) {
          return [];
        }

        const loadedComponents = await Promise.all(
          contentComponents.map(
            async ({ id, type, denomination, is_published, is_required, rank }) => {
              const componentValuesToInject = {
                denomination,
                type,
                is_published,
                is_required,
                rank,
              };

              switch (type) {
                case ContentComponentTypeEnumType.Text:
                  const textContent = await loaders.TextContent.loadByComponentId(id);
                  return textContent ? { ...textContent, ...componentValuesToInject } : null;
                case ContentComponentTypeEnumType.Video:
                  const videoContent = await loaders.VideoContent.loadByComponentId(id);
                  return videoContent ? { ...videoContent, ...componentValuesToInject } : null;
                default:
                  return null;
              }
            },
          ),
        );

        const components = loadedComponents
          .filter((component) => component !== null && component.is_published)
          .sort((a, b) => {
            if (a === null || b === null) {
              return 0;
            }
            return a.rank - b.rank;
          });

        return components;
      },
    },
  },
});
