import { GraphQLFieldConfig, GraphQLNonNull } from 'graphql';

import {
  TextContentInput as TextContentInputType,
  UpdateContentComponentBaseInput as UpdateContentComponentBaseInputType,
  VideoContentInput as VideoContentInputType,
  YouTubeContentInput as YouTubeContentInputType,
} from '../../../types/schema-types.js';
import { ContextType } from '../../../types/types.js';
import { ErrorType } from '../../../utils/ErrorType.js';
import { authenticated } from '../../utils/auth.js';
import { hasTeacherRole } from '../../utils/hasTeacherRole.js';
import TextContentInput from '../inputs/TextContent.js';
import logger from '../../../utils/logger.js';
import UpdateContentComponentBaseInput from '../inputs/UpdateContentComponentBase.js';
import VideoContentInput from '../inputs/VideoContent.js';
import YouTubeContentInput from '../inputs/YouTubeContent.js';
import { CreateOrUpdateContentComponent } from '../types/CreateOrUpdateContentComponent.js';

const updateContentComponent: GraphQLFieldConfig<null, ContextType> = {
  type: CreateOrUpdateContentComponent,
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
    youtubeContent: {
      type: YouTubeContentInput,
      description: 'The YouTube content for the component.',
    },
  },
  resolve: authenticated(
    async (
      _,
      {
        baseComponentInfo,
        textContent,
        videoContent,
        youtubeContent,
      }: {
        baseComponentInfo: UpdateContentComponentBaseInputType;
        textContent: TextContentInputType;
        videoContent: VideoContentInputType;
        youtubeContent: YouTubeContentInputType;
      },
      { db, loaders, user },
    ) => {
      if (!baseComponentInfo) {
        return {
          success: false,
          errors: [new Error(ErrorType.INVALID_INPUT)],
          component: null,
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
            component: null,
          };
        }

        if ((baseComponentInfo.type as string) !== contentComponent.type) {
          return {
            success: false,
            errors: [new Error(ErrorType.INVALID_INPUT)],
            component: null,
          };
        }

        const isTeacher = await hasTeacherRole(loaders, user.roleId);

        if (!isTeacher) {
          return {
            success: false,
            errors: [new Error(ErrorType.PERMISSION_DENIED)],
            component: null,
          };
        }

        await db.transaction(async (transaction) => {
          const { id, type, denomination, isPublished, isRequired } = baseComponentInfo;
          const valuesToUpdate = {
            ...(denomination && { denomination }),
            ...(isPublished !== undefined && { is_published: isPublished }),
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
                throw new Error(ErrorType.INVALID_INPUT);
              }

              await transaction('text_content').where('component_id', id).update({
                content: textContent.content,
                updated_at: db.fn.now(),
              });
              break;

            case 'video':
              if (!videoContent) {
                throw new Error(ErrorType.INVALID_INPUT);
              }

              await transaction('video_content').where('component_id', id).update({
                url: videoContent.url,
                updated_at: db.fn.now(),
              });
              break;

            case 'youtube':
              if (!youtubeContent) {
                throw new Error(ErrorType.INVALID_INPUT);
              }

              await transaction('youtube_content')
                .where('component_id', id)
                .update({
                  youtube_video_id: youtubeContent.videoId,
                  description: youtubeContent.description || null,
                  updated_at: db.fn.now(),
                });
              break;
          }

          loaders.ContentComponent.loaders.byIdLoader.clear(parseInt(id, 10));
        });

        return {
          success: true,
          errors: [],
          component: contentComponent,
        };
      } catch (error) {
        if (error instanceof Error && error.message === ErrorType.INVALID_INPUT) {
          return {
            success: false,
            errors: [new Error(ErrorType.INVALID_INPUT)],
            component: null,
          };
        }

        logger.error({ err: error, userId: user.id }, 'Failed to update content component');
        return {
          success: false,
          errors: [new Error(ErrorType.INTERNAL_SERVER_ERROR)],
          component: null,
        };
      }
    },
  ),
};

export default updateContentComponent;
