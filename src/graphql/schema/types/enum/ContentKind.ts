import { GraphQLEnumType } from 'graphql';

const ContentKind = new GraphQLEnumType({
  name: 'ContentKind',
  description: 'Restricts a mixed course/program result to a single content type.',
  values: {
    course: {
      value: 'course',
    },
    program: {
      value: 'program',
    },
  },
});

export default ContentKind;
