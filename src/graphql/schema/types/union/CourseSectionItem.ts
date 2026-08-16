import { GraphQLUnionType } from 'graphql';

import { CourseSectionItemContentTypeEnumType } from '../../../../types/db-generated-types.js';
import { Lesson } from '../Lesson.js';
import { Quiz } from '../Quiz.js';

export const CourseSectionItem = new GraphQLUnionType({
  name: 'CourseSectionItem',
  description: 'Course section item which contains the course curriculum (e.g. lesson, quiz)',
  types: [Lesson, Quiz],
  resolveType(value) {
    switch (value.content_type) {
      case CourseSectionItemContentTypeEnumType.Lesson:
        return 'Lesson';
      case CourseSectionItemContentTypeEnumType.Quiz:
        return 'Quiz';
      default:
        return 'UNKNOWN_ITEM_TYPE';
    }
  },
});
