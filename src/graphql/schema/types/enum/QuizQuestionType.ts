import { GraphQLEnumType } from 'graphql';

export enum QuizQuestionTypeEnum {
  SingleChoice = 'single_choice',
  MultiSelect = 'multi_select',
  TrueFalse = 'true_false',
}

const QuizQuestionType = new GraphQLEnumType({
  name: 'QuizQuestionType',
  description: 'The type of a quiz question.',
  values: {
    single_choice: {
      value: 'single_choice',
    },
    multi_select: {
      value: 'multi_select',
    },
    true_false: {
      value: 'true_false',
    },
  },
});

export default QuizQuestionType;
