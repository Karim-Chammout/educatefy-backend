import { GraphQLEnumType } from 'graphql';

export const ComponentType = new GraphQLEnumType({
  name: 'ComponentType',
  description: 'The type of the component.',
  values: {
    text: {
      value: 'text',
    },
    video: {
      value: 'video',
    },
  },
});

export const ComponentParentType = new GraphQLEnumType({
  name: 'ComponentParentType',
  description: 'The parent table name of the component',
  values: {
    lesson: {
      value: 'lesson',
    },
  },
});
