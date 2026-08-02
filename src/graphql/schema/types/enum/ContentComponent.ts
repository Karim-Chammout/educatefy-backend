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
    youtube: {
      value: 'youtube',
    },
    audio: {
      value: 'audio',
    },
    document: {
      value: 'document',
    },
    embed: {
      value: 'embed',
    },
    image: {
      value: 'image',
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
