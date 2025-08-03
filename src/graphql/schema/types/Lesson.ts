import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

import { Lesson as LessonType } from '../../../types/db-generated-types';
import { ContextType } from '../../../types/types';
import { loadComponents } from '../../utils/contentComponentLoader';
import { hasTeacherRole } from '../../utils/hasTeacherRole';
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
      resolve: async (parent, _, { loaders, user }) => {
        const contentComponents = await loaders.ContentComponent.loadByParentIdAndParentType(
          parent.id,
          'lesson',
        );

        if (!contentComponents || contentComponents.length === 0) {
          return [];
        }

        const loadedComponents = await loadComponents(loaders, contentComponents);

        const isTeacher = user.authenticated && (await hasTeacherRole(loaders, user.roleId));

        const components = loadedComponents.filter((component) => component !== null);

        const filteredComponents = isTeacher
          ? components
          : components.filter((component) => component.is_published);

        const sortedComponents = filteredComponents.sort((a, b) => a.rank - b.rank);

        return sortedComponents;
      },
    },
  },
});
