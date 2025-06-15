import { GraphQLFieldConfig, GraphQLNonNull } from 'graphql';

import { FollowTeacherInput as FollowTeacherInputType } from '../../../types/schema-types';
import { ContextType } from '../../../types/types';
import { ErrorType } from '../../../utils/ErrorType';
import { authenticated } from '../../utils/auth';
import { hasTeacherRole } from '../../utils/hasTeacherRole';
import FollowTeacherInput from '../inputs/FollowTeacherInput';
import { FollowTeacherResult } from '../types/FollowTeacherResult';

const followTeacher: GraphQLFieldConfig<null, ContextType> = {
  type: FollowTeacherResult,
  description: 'Follow or unfollow a teacher. Toggles the follow status.',
  args: {
    followTeacherInfo: {
      type: new GraphQLNonNull(FollowTeacherInput),
      description: 'The teacher follow information',
    },
  },
  resolve: authenticated(
    async (
      _,
      { followTeacherInfo }: { followTeacherInfo: FollowTeacherInputType },
      { db, loaders, user },
    ) => {
      const { teacherId } = followTeacherInfo;

      if (!teacherId) {
        return {
          success: false,
          errors: [new Error(ErrorType.INVALID_INPUT)],
          isFollowing: null,
        };
      }

      try {
        const parsedTeacherId = parseInt(teacherId, 10);

        const teacher = await loaders.Account.loadById(parsedTeacherId);
        if (!teacher) {
          return {
            success: false,
            errors: [new Error(ErrorType.NOT_FOUND)],
            isFollowing: null,
          };
        }

        const isTeacher = await hasTeacherRole(loaders, teacher.role_id);
        if (!isTeacher) {
          return {
            success: false,
            errors: [new Error(ErrorType.INVALID_INPUT)],
            isFollowing: null,
          };
        }

        // Prevent self-following
        if (user.id === parsedTeacherId) {
          return {
            success: false,
            errors: [new Error(ErrorType.INVALID_INPUT)],
            isFollowing: null,
          };
        }

        const existingFollow = await db('student_teacher_follow')
          .where({
            student_id: user.id,
            teacher_id: parsedTeacherId,
          })
          .first();

        let isFollowing: boolean;

        if (existingFollow) {
          // Toggle the follow status and update timestamp
          isFollowing = !existingFollow.is_following;
          await db('student_teacher_follow')
            .where({
              student_id: user.id,
              teacher_id: parsedTeacherId,
            })
            .update({
              is_following: isFollowing,
              updated_at: db.fn.now(),
            });
        } else {
          await db('student_teacher_follow').insert({
            student_id: user.id,
            teacher_id: parsedTeacherId,
            is_following: true,
          });
          isFollowing = true;
        }

        return {
          success: true,
          errors: [],
          isFollowing,
        };
      } catch (error) {
        console.log('Failed to follow/unfollow teacher: ', error);
        return {
          success: false,
          errors: [new Error(ErrorType.INTERNAL_SERVER_ERROR)],
          isFollowing: null,
        };
      }
    },
  ),
};

export default followTeacher;
