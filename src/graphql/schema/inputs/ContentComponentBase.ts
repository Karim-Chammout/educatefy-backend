import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql';

const ComponentType = new GraphQLEnumType({
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

const ComponentParentType = new GraphQLEnumType({
  name: 'ComponentParentType',
  description: 'The parent table name of the component',
  values: {
    lesson: {
      value: 'lesson',
    },
  },
});

const ContentComponentBaseInput = new GraphQLInputObjectType({
  name: 'ContentComponentBaseInput',
  fields: {
    parentId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The ID of the parent of the component.',
    },
    parentType: {
      type: new GraphQLNonNull(ComponentParentType),
      description: 'The parent table name of the component',
    },
    type: {
      type: new GraphQLNonNull(ComponentType),
      description: 'The type of the component.',
    },
    denomination: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The denomination of the component.',
    },
    isRequired: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'A flag indicating whether the component is required to continue.',
    },
    isPublished: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'A flag indicating whether the component is published.',
    },
  },
});

export default ContentComponentBaseInput;
