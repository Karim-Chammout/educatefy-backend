import { GraphQLUnionType } from 'graphql';

import { CourseSectionItemContentTypeEnumType } from '../../../../types/db-generated-types';
import { Lesson } from '../Lesson';

export const CourseSectionItem = new GraphQLUnionType({
  name: 'CourseSectionItem',
  description: 'Course section item which contains the course curriculum (e.g. lesson)',
  types: [Lesson],
  resolveType(value) {
    switch (value.content_type) {
      case CourseSectionItemContentTypeEnumType.Lesson:
        return 'Lesson';
      default:
        return 'UNKNOWN_ITEM_TYPE';
    }
  },
});
