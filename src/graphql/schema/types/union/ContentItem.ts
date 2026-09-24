import { GraphQLUnionType } from 'graphql';

import { Course } from '../Course.js';
import { Program } from '../Program.js';

type RankedContentRow = {
  kind: 'course' | 'program';
} & Record<string, unknown>;

export const ContentItem = new GraphQLUnionType({
  name: 'ContentItem',
  description: 'A rankable content item, which can be either a course or a program.',
  types: [Course, Program],
  resolveType(value: RankedContentRow) {
    return value.kind === 'program' ? 'Program' : 'Course';
  },
});
