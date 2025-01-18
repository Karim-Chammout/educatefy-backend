import { GraphQLFieldConfig, GraphQLNonNull } from 'graphql';

import { UpdateCourseSectionInfo as UpdateCourseSectionInfoInputType } from '../../../types/schema-types';
import { ContextType } from '../../../types/types';
import { ErrorType } from '../../../utils/ErrorType';
import { authenticated } from '../../utils/auth';
import UpdateCourseSectionInfo from '../inputs/UpdateCourseSectionInfo';
import { CreateOrUpdateCourseSectionResult } from '../types/CreateOrUpdateCourseSectionResult';

const updateCourseSection: GraphQLFieldConfig<null, ContextType> = {
  type: CreateOrUpdateCourseSectionResult,
  description: 'Updates a course section.',
  args: {
    courseSectionInfo: {
      type: new GraphQLNonNull(UpdateCourseSectionInfo),
      description: 'The course section information',
    },
  },
  resolve: authenticated(
    async (
      _,
      { courseSectionInfo }: { courseSectionInfo: UpdateCourseSectionInfoInputType },
      { db, loaders, user },
    ) => {
      const { id, denomination, is_published } = courseSectionInfo;

      if (!id) {
        return {
          success: false,
          errors: [new Error(ErrorType.INVALID_INPUT)],
          courseSection: null,
        };
      }

      try {
        const courseSectionId = parseInt(id, 10);
        const courseSection = await loaders.CourseSection.loadById(courseSectionId);

        if (!courseSection) {
          return {
            success: false,
            errors: [new Error(ErrorType.NOT_FOUND)],
            courseSection: null,
          };
        }

        const course = await loaders.Course.loadById(courseSection.course_id);

        if (!course || course.teacher_id !== user.id) {
          return {
            success: false,
            errors: [new Error(ErrorType.FORBIDDEN)],
            courseSection: null,
          };
        }

        const dataToUpdate = {
          ...(denomination && { denomination: denomination.trim() }),
          ...(is_published !== undefined && { is_published }),
        };

        const [updatedCourseSection] = await db('course_section')
          .where('id', courseSection.id)
          .update({
            ...dataToUpdate,
            updated_at: db.fn.now(),
          })
          .returning('id');

        loaders.CourseSection.loaders.byIdLoader.clear(updatedCourseSection.id);

        return {
          success: true,
          errors: [],
          courseSection: updatedCourseSection,
        };
      } catch (error) {
        console.log('Failed to update course section: ', error);
        return {
          success: false,
          errors: [new Error(ErrorType.INTERNAL_SERVER_ERROR)],
          courseSection: null,
        };
      }
    },
  ),
};

export default updateCourseSection;
