import { GraphQLFieldConfig, GraphQLNonNull } from 'graphql';

import { CourseInfoInput as CourseInfoInputType, CourseLevel } from '../../../types/schema-types';
import { ContextType } from '../../../types/types';
import { ErrorType } from '../../../utils/ErrorType';
import { authenticated } from '../../utils/auth';
import { getSelectedLanguageId } from '../../utils/getSelectedLanguageId';
import { isValidSlug } from '../../utils/isValidSlug';
import CourseInfoInput from '../inputs/CourseInfo';
import { CreateCourseResult } from '../types/CreateCourseResult';
import { AccountRoleEnum } from '../types/enum/AccountRole';

const createCourse: GraphQLFieldConfig<null, ContextType> = {
  type: CreateCourseResult,
  description: 'Creates a course.',
  args: {
    courseInfo: {
      type: new GraphQLNonNull(CourseInfoInput),
      description: 'The course information',
    },
  },
  resolve: authenticated(
    async (_, { courseInfo }: { courseInfo: CourseInfoInputType }, { db, loaders, user }) => {
      const {
        denomination,
        description,
        slug,
        level,
        is_published,
        subtitle,
        end_date,
        image,
        language,
        external_resource_link,
        external_meeting_link,
        start_date,
      } = courseInfo;

      if (
        !denomination ||
        !slug ||
        !description ||
        !subtitle ||
        !Object.values(CourseLevel).includes(level)
      ) {
        return {
          success: false,
          errors: [new Error(ErrorType.INVALID_INPUT)],
          course: null,
        };
      }

      const languageId = await getSelectedLanguageId(loaders, language);

      if (!languageId) {
        return {
          success: false,
          errors: [new Error(ErrorType.NOT_SUPPORTED_LANGUAGE)],
          course: null,
        };
      }

      const lowercaseSlug = slug.toLowerCase();

      if (!isValidSlug(lowercaseSlug)) {
        return {
          success: false,
          errors: [new Error(ErrorType.INVALID_SLUG)],
          course: null,
        };
      }

      const existingCourseBySlug = await loaders.Course.loadBySlug(lowercaseSlug);

      if (existingCourseBySlug) {
        return {
          success: false,
          errors: [new Error(ErrorType.SLUG_ALREADY_TAKEN)],
          course: null,
        };
      }

      try {
        const accountRole = await loaders.AccountRole.loadById(user.roleId);

        if (accountRole.code !== AccountRoleEnum.Teacher) {
          return {
            success: false,
            errors: [new Error(ErrorType.PERMISSION_DENIED)],
            course: null,
          };
        }

        const filteredCourseInfo = {
          denomination,
          slug: lowercaseSlug,
          description,
          level,
          is_published,
          subtitle,
          language_id: languageId,
          ...(image && { image }),
          ...(external_resource_link && { external_resource_link }),
          ...(external_meeting_link && { external_meeting_link }),
          ...(end_date && { end_date }),
          ...(start_date && { start_date }),
          teacher_id: user.id,
        };

        const [createdCourse] = await db('course').insert(filteredCourseInfo).returning('id');

        return {
          success: true,
          errors: [],
          course: createdCourse,
        };
      } catch (error) {
        console.log('Failed to create course: ', error);
        return {
          success: false,
          errors: [new Error(ErrorType.INTERNAL_SERVER_ERROR)],
          course: null,
        };
      }
    },
  ),
};

export default createCourse;