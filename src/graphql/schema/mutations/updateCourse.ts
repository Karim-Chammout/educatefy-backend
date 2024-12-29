import { GraphQLFieldConfig, GraphQLNonNull } from 'graphql';

import {
  CourseLevel,
  UpdateCourseInfoInput as UpdateCourseInfoInputType,
} from '../../../types/schema-types';
import { ContextType } from '../../../types/types';
import { ErrorType } from '../../../utils/ErrorType';
import { authenticated } from '../../utils/auth';
import { getSelectedLanguageId } from '../../utils/getSelectedLanguageId';
import { isValidSlug } from '../../utils/isValidSlug';
import UpdateCourseInfoInput from '../inputs/UpdateCourseInfo';
import { CreateOrUpdateCourseResult } from '../types/CreateOrUpdateCourseResult';

const updateCourse: GraphQLFieldConfig<null, ContextType> = {
  type: CreateOrUpdateCourseResult,
  description: 'Updates a course.',
  args: {
    updateCourseInfo: {
      type: new GraphQLNonNull(UpdateCourseInfoInput),
      description: 'The course information to be updated.',
    },
  },
  resolve: authenticated(
    async (
      _,
      { updateCourseInfo }: { updateCourseInfo: UpdateCourseInfoInputType },
      { db, loaders, user },
    ) => {
      const {
        id,
        denomination,
        description,
        slug,
        level,
        language,
        is_published,
        subtitle,
        image,
        external_resource_link,
        external_meeting_link,
        start_date,
        end_date,
      } = updateCourseInfo;

      if (!id || (level && !Object.values(CourseLevel).includes(level))) {
        return {
          success: false,
          errors: [new Error(ErrorType.INVALID_INPUT)],
          course: null,
        };
      }

      try {
        const courseId = parseInt(id, 10);

        let updatedSlug = null;
        if (slug) {
          const lowercaseSlug = slug.toLowerCase();
          if (!isValidSlug(lowercaseSlug)) {
            return {
              success: false,
              errors: [new Error(ErrorType.INVALID_SLUG)],
              course: null,
            };
          }

          const existingCourseBySlug = await loaders.Course.loadBySlug(lowercaseSlug);

          if (
            existingCourseBySlug &&
            existingCourseBySlug.id !== courseId &&
            existingCourseBySlug.slug === lowercaseSlug
          ) {
            return {
              success: false,
              errors: [new Error(ErrorType.SLUG_ALREADY_TAKEN)],
              course: null,
            };
          }

          updatedSlug = lowercaseSlug;
        }

        let languageId = null;
        if (language) {
          languageId = await getSelectedLanguageId(loaders, language, true);
        }

        const course = await loaders.Course.loadById(courseId);

        if (!course) {
          return {
            success: false,
            errors: [new Error(ErrorType.NOT_FOUND)],
            course: null,
          };
        }

        if (course.teacher_id !== user.id) {
          return {
            success: false,
            errors: [new Error(ErrorType.FORBIDDEN)],
            course: null,
          };
        }

        const filteredUpdatedCourseInfo = {
          ...(denomination && { denomination }),
          ...(updatedSlug && { slug: updatedSlug }),
          ...(description && { description }),
          ...(subtitle && { subtitle }),
          ...(level && { level }),
          ...(is_published !== undefined && { is_published }),
          ...(image && { image }),
          ...(languageId && { language_id: languageId }),
          ...(external_resource_link && { external_resource_link }),
          ...(external_meeting_link && { external_meeting_link }),
          ...(end_date && { end_date }),
          ...(start_date && { start_date }),
        };

        const [updatedCourse] = await db('course')
          .where('id', course.id)
          .update({ ...filteredUpdatedCourseInfo, updated_at: db.fn.now() })
          .returning('*');

        loaders.Course.loaders.byIdLoader.clear(course.id);

        return {
          success: true,
          errors: [],
          course: updatedCourse,
        };
      } catch (error) {
        console.log('Faild to update a course: ', error);
        return {
          success: false,
          errors: [new Error(ErrorType.INTERNAL_SERVER_ERROR)],
          course: null,
        };
      }
    },
  ),
};

export default updateCourse;
