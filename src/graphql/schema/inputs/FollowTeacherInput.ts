import { GraphQLInputObjectType, GraphQLNonNull, GraphQLString } from 'graphql';

const FollowTeacherInput = new GraphQLInputObjectType({
  name: 'FollowTeacherInput',
  description: 'Input for following/unfollowing a teacher',
  fields: {
    teacherId: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The ID of the teacher to follow/unfollow',
    },
  },
});

export default FollowTeacherInput;
