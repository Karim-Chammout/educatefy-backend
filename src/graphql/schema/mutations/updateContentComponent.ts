import { GraphQLFieldConfig, GraphQLNonNull } from 'graphql';

import {
  TextContentInput as TextContentInputType,
  UpdateContentComponentBaseInput as UpdateContentComponentBaseInputType,
  VideoContentInput as VideoContentInputType,
} from '../../../types/schema-types';
import { ContextType } from '../../../types/types';
import { ErrorType } from '../../../utils/ErrorType';
import { sanitizeText } from '../../../utils/sanitizeText';
import { authenticated } from '../../utils/auth';
import { hasTeacherRole } from '../../utils/hasTeacherRole';
import TextContentInput from '../inputs/TextContent';
import UpdateContentComponentBaseInput from '../inputs/UpdateContentComponentBase';
import VideoContentInput from '../inputs/VideoContent';
import MutationResult from '../types/MutationResult';

const updateContentComponent: GraphQLFieldConfig<null, ContextType> = {
  type: MutationResult,
  description: 'Updates a content component.',
  args: {
    baseComponentInfo: {
      type: new GraphQLNonNull(UpdateContentComponentBaseInput),
      description: 'The base component data to update.',
    },
    textContent: {
      type: TextContentInput,
      description: 'The text content for the component.',
    },
    videoContent: {
      type: VideoContentInput,
      description: 'The video content for the component.',
    },
  },
  resolve: authenticated(
    async (
      _,
      {
        baseComponentInfo,
        textContent,
        videoContent,
      }: {
        baseComponentInfo: UpdateContentComponentBaseInputType;
        textContent: TextContentInputType;
        videoContent: VideoContentInputType;
      },
      { db, loaders, user },
    ) => {
      if (!baseComponentInfo) {
        return {
          success: false,
          errors: [new Error(ErrorType.INVALID_INPUT)],
        };
      }

      try {
        const contentComponent = await loaders.ContentComponent.loadById(
          parseInt(baseComponentInfo.id, 10),
        );

        if (!contentComponent) {
          return {
            success: false,
            errors: [new Error(ErrorType.NOT_FOUND)],
          };
        }

        if ((baseComponentInfo.type as string) !== contentComponent.type) {
          return {
            success: false,
            errors: [new Error(ErrorType.INVALID_INPUT)],
          };
        }

        const isTeacher = await hasTeacherRole(loaders, user.roleId);

        if (!isTeacher) {
          return {
            success: false,
            errors: [new Error(ErrorType.PERMISSION_DENIED)],
          };
        }

        await db.transaction(async (transaction) => {
          const { id, type, denomination, isPublished, isRequired } = baseComponentInfo;
          const valuesToUpdate = {
            ...(denomination && { denomination }),
            ...(isPublished !== undefined && { is_required: isPublished }),
            ...(isRequired !== undefined && { is_required: isRequired }),
          };

          // Update base component
          await transaction('content_component')
            .where('id', id)
            .update({
              ...valuesToUpdate,
              updated_at: db.fn.now(),
            });

          // Update specific content based on type
          switch (type) {
            case 'text':
              if (!textContent) {
                return {
                  success: false,
                  errors: [new Error(ErrorType.INVALID_INPUT)],
                };
              }

              await transaction('text_content')
                .where('component_id', id)
                .update({
                  content: sanitizeText(textContent.content),
                  updated_at: db.fn.now(),
                });
              break;

            case 'video':
              if (!videoContent) {
                return {
                  success: false,
                  errors: [new Error(ErrorType.INVALID_INPUT)],
                };
              }

              await transaction('video_content').where('component_id', id).update({
                url: videoContent.url,
                updated_at: db.fn.now(),
              });
              break;
          }

          loaders.ContentComponent.loaders.byIdLoader.clear(parseInt(id, 10));
        });

        return {
          success: true,
          errors: [],
        };
      } catch (error) {
        console.log('Failed to update content component: ', error);
        return {
          success: false,
          errors: [new Error(ErrorType.INTERNAL_SERVER_ERROR)],
        };
      }
    },
  ),
};

export default updateContentComponent;
