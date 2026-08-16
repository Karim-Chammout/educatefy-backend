import { GraphQLEnumType } from 'graphql';

export enum QuizQuestionMediaTypeEnum {
  Image = 'image',
  Video = 'video',
}

const QuizQuestionMediaType = new GraphQLEnumType({
  name: 'QuizQuestionMediaType',
  description: 'The type of media attached to a quiz question.',
  values: {
    image: {
      value: 'image',
    },
    video: {
      value: 'video',
    },
  },
});

export default QuizQuestionMediaType;
