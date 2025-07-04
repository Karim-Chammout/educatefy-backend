import { GraphQLFieldConfig, GraphQLNonNull } from 'graphql';

import { UpdateContentComponentProgressInput as UpdateContentComponentProgressInputType } from '../../../types/schema-types';
import { ContextType } from '../../../types/types';
import { ErrorType } from '../../../utils/ErrorType';
import { authenticated } from '../../utils/auth';
import { UpdateContentComponentProgressInput } from '../inputs/UpdateContentComponentProgress';
import { ContentComponentProgressResult } from '../types/ContentComponentProgressResult';

const updateContentComponentProgress: GraphQLFieldConfig<null, ContextType> = {
  type: ContentComponentProgressResult,
  description: 'Updates the progress of a content component.',
  args: {
    progressInput: {
      type: new GraphQLNonNull(UpdateContentComponentProgressInput),
      description: 'The progress update input',
    },
  },
  resolve: authenticated(
    async (
      _,
      { progressInput }: { progressInput: UpdateContentComponentProgressInputType },
      { db, loaders, user },
    ) => {
      const { contentComponentId, isCompleted } = progressInput;

      const componentId = parseInt(contentComponentId, 10);

      const component = await loaders.ContentComponent.loadById(componentId);

      if (!component) {
        return {
          success: false,
          errors: [new Error(ErrorType.NOT_FOUND)],
          contentComponentProgress: null,
        };
      }

      // Get the lesson associated with this component
      const lesson = await loaders.Lesson.loadById(component.parent_id);

      if (!lesson) {
        return {
          success: false,
          errors: [new Error(ErrorType.NOT_FOUND)],
          contentComponentProgress: null,
        };
      }

      // Get the user's enrollment for this course
      const enrollment = await loaders.Enrollment.loadByAccountIdAndCourseId(
        user.id,
        lesson.course_id,
      );

      if (!enrollment) {
        return {
          success: false,
          errors: [new Error(ErrorType.NO_ENROLLMENT_FOUND)],
          contentComponentProgress: null,
        };
      }

      try {
        const result = await db.transaction(async (transaction) => {
          // Check if progress record exists
          const existingProgress =
            await loaders.ContentComponentProgress.loadByAccountIdAndComponentId(
              user.id,
              componentId,
            );

          const progressData = {
            is_completed: isCompleted || false,
            completed_at: isCompleted ? db.fn.now() : null,
            updated_at: db.fn.now(),
          };

          let progressRecord;

          if (!existingProgress) {
            const insertData = {
              account_id: user.id,
              content_component_id: componentId,
              enrollment_id: enrollment.id,
              ...progressData,
            };

            [progressRecord] = await transaction('content_component_progress')
              .insert(insertData)
              .returning('*');
          } else {
            // Update existing progress record
            [progressRecord] = await transaction('content_component_progress')
              .where('id', existingProgress.id)
              .update(progressData)
              .returning('*');
          }

          return progressRecord;
        });

        // Clear cache
        loaders.ContentComponentProgress.loaders.byAccountIdAndComponentIdLoader.clear({
          accountId: user.id,
          componentId: componentId,
        });
        loaders.ContentComponent.loaders.byIdLoader.clear(componentId);

        return {
          success: true,
          errors: [],
          contentComponentProgress: result,
        };
      } catch (error) {
        console.log('Failed to update content component progress: ', error);
        return {
          success: false,
          errors: [new Error(ErrorType.INTERNAL_SERVER_ERROR)],
          contentComponentProgress: null,
        };
      }
    },
  ),
};

export default updateContentComponentProgress;
