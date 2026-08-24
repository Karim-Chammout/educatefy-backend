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
  ContentComponentParentTableEnumType,
  CourseSectionItemContentTypeEnumType,
  Lesson as LessonType,
} from '../../../types/db-generated-types.js';
import { ContextType } from '../../../types/types.js';
import { loadComponents } from '../../utils/contentComponentLoader.js';
import { ContentComponent } from './union/ContentComponent.js';

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
      resolve: async (parent, _, { loaders }) => {
        const parentWithItemId = parent as LessonType & { itemId?: number };

        if (parentWithItemId.itemId) {
          return parentWithItemId.itemId;
        }

        const sectionItems = await loaders.CourseSectionItem.loadByContentIdAndType(
          parent.id,
          CourseSectionItemContentTypeEnumType.Lesson,
        );

        if (!sectionItems || sectionItems.length === 0) {
          throw new Error('Course section item not found for this lesson.');
        }

        return sectionItems[0].id;
      },
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
      resolve: async (parent, _, { loaders, user }) => {
        const contentComponents = await loaders.ContentComponent.loadByParentIdAndParentType(
          parent.id,
          ContentComponentParentTableEnumType.Lesson,
        );

        if (!contentComponents || contentComponents.length === 0) {
          return [];
        }

        const loadedComponents = await loadComponents(loaders, contentComponents);

        // Draft preview is restricted to the lesson owner.
        const canPreview = user.authenticated && parent.teacher_id === user.id;

        const components = loadedComponents.filter((component) => component !== null);

        const filteredComponents = canPreview
          ? components
          : components.filter((component) => component.is_published);

        const sortedComponents = filteredComponents.sort((a, b) => a.rank - b.rank);

        return sortedComponents;
      },
    },
  },
});
