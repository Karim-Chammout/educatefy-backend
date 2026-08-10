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
  Quiz as QuizType,
} from '../../../types/db-generated-types.js';
import { ContextType } from '../../../types/types.js';
import { hasTeacherRole } from '../../utils/hasTeacherRole.js';
import QuizNavigationMode from './enum/QuizNavigationMode.js';
import { QuizAttempt } from './QuizAttempt.js';
import { QuizQuestion } from './QuizQuestion.js';

export const Quiz = new GraphQLObjectType<QuizType, ContextType>({
  name: 'Quiz',
  description: 'The quiz info',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'A unique id of this quiz.',
    },
    itemId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The ID of the section item this quiz belongs to.',
      resolve: async (parent, _, { loaders }) => {
        const parentWithItemId = parent as QuizType & { itemId?: number };

        if (parentWithItemId.itemId) {
          return parentWithItemId.itemId;
        }

        const sectionItems = await loaders.CourseSectionItem.loadByContentIdAndType(
          parent.id,
          CourseSectionItemContentTypeEnumType.Quiz,
        );

        if (!sectionItems || sectionItems.length === 0) {
          throw new Error('Course section item not found for this quiz.');
        }

        return sectionItems[0].id;
      },
    },
    denomination: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The denomination of this quiz.',
    },
    is_published: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'A flag to indicate whether this quiz is published or not.',
    },
    passing_score: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The passing score in percentage.',
    },
    max_attempts: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The maximum number of allowed attempts.',
    },
    shuffle_questions: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'A flag to indicate whether the question order is shuffled per attempt.',
    },
    shuffle_answers: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'A flag to indicate whether the answer order is shuffled per attempt.',
    },
    navigation_mode: {
      type: new GraphQLNonNull(QuizNavigationMode),
      description: 'How students navigate through the questions.',
    },
    questions_per_page: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The number of questions shown per page (0 means all on one page).',
    },
    show_correct_answers: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'Whether the correct answers are revealed to the student after submission.',
    },
    time_limit_minutes: {
      type: GraphQLInt,
      description: 'The time limit in minutes, null means no limit.',
    },
    feedback_passed: {
      type: GraphQLString,
      description: 'The overall feedback shown when the quiz is passed.',
    },
    feedback_failed: {
      type: GraphQLString,
      description: 'The overall feedback shown when the quiz is failed.',
    },
    questions: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(QuizQuestion))),
      description: 'The questions of this quiz (only visible to teachers).',
      resolve: async (parent, _, { loaders, user }) => {
        const isTeacher = user.authenticated && (await hasTeacherRole(loaders, user.roleId));

        if (!isTeacher) {
          return [];
        }

        const questions = await loaders.QuizQuestion.loadByQuizId(parent.id);

        return [...questions].sort((a, b) => a.rank - b.rank);
      },
    },
    passed: {
      type: GraphQLBoolean,
      description: 'Whether the current user has a completed attempt that passed this quiz.',
      resolve: async (parent, _, { db, user }) => {
        if (!user.authenticated) {
          return null;
        }

        const attempts = await db('quiz_attempt')
          .where('quiz_id', parent.id)
          .where('account_id', user.id)
          .where('status', 'completed')
          .select('passed');

        return attempts.some((attempt) => attempt.passed);
      },
    },
    attempts: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(QuizAttempt))),
      description: 'The attempts of the current user for this quiz.',
      resolve: async (parent, _, { db, user }) => {
        if (!user.authenticated) {
          return [];
        }

        const attempts = await db('quiz_attempt')
          .where('quiz_id', parent.id)
          .where('account_id', user.id)
          .orderBy('attempt_number', 'asc');

        return attempts;
      },
    },
  },
});
