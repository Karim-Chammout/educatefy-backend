import { GraphQLFieldConfig, GraphQLNonNull } from 'graphql';

import {
  ContentComponentBaseInput as ContentComponentBaseInputType,
  TextContentInput as TextContentInputType,
  VideoContentInput as VideoContentInputType,
  YouTubeContentInput as YouTubeContentInputType,
} from '../../../types/schema-types';
import { ContextType } from '../../../types/types';
import { ErrorType } from '../../../utils/ErrorType';
import { sanitizeText } from '../../../utils/sanitizeText';
import { authenticated } from '../../utils/auth';
import { hasTeacherRole } from '../../utils/hasTeacherRole';
import ContentComponentBaseInput from '../inputs/ContentComponentBase';
import TextContentInput from '../inputs/TextContent';
import VideoContentInput from '../inputs/VideoContent';
import YouTubeContentInput from '../inputs/YouTubeContent';
import { CreateOrUpdateContentComponent } from '../types/CreateOrUpdateContentComponent';

export const createContentComponent: GraphQLFieldConfig<null, ContextType> = {
  type: CreateOrUpdateContentComponent,
  description: 'Creates a content component.',
  args: {
    baseComponentInfo: {
      type: new GraphQLNonNull(ContentComponentBaseInput),
      description: 'The base component data',
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
        baseComponentInfo: ContentComponentBaseInputType;
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

      if (!textContent && !videoContent && !youtubeContent) {
        return {
          success: false,
          errors: [new Error(ErrorType.MISSING_INPUT)],
          component: null,
        };
      }

      try {
        const isTeacher = await hasTeacherRole(loaders, user.roleId);

        if (!isTeacher) {
          return {
            success: false,
            errors: [new Error(ErrorType.PERMISSION_DENIED)],
            component: null,
          };
        }

        const createdComponent = await db.transaction(async (transaction) => {
          // Insert base component
          const [component] = await transaction('content_component')
            .insert({
              parent_id: baseComponentInfo.parentId,
              parent_table: baseComponentInfo.parentType,
              denomination: baseComponentInfo.denomination,
              type: baseComponentInfo.type,
              is_required: baseComponentInfo.isRequired,
              is_published: baseComponentInfo.isPublished,
            })
            .returning('id');

          // Insert specific content based on type
          switch (baseComponentInfo.type) {
            case 'text':
              if (!textContent) {
                return {
                  success: false,
                  errors: [new Error(ErrorType.INVALID_INPUT)],
                  component: null,
                };
              }

              await transaction('text_content').insert({
                component_id: component.id,
                content: sanitizeText(textContent.content),
              });
              break;

            case 'video':
              if (!videoContent) {
                return {
                  success: false,
                  errors: [new Error(ErrorType.INVALID_INPUT)],
                  component: null,
                };
              }

              await transaction('video_content').insert({
                component_id: component.id,
                url: videoContent.url,
              });
              break;

            case 'youtube':
              if (!youtubeContent) {
                return {
                  success: false,
                  errors: [new Error(ErrorType.INVALID_INPUT)],
                  component: null,
                };
              }

              await transaction('youtube_content').insert({
                component_id: component.id,
                youtube_video_id: youtubeContent.videoId,
                description: youtubeContent.description || null,
              });
              break;
          }

          return component;
        });

        return {
          success: true,
          errors: [],
          component: createdComponent,
        };
      } catch (error) {
        console.log('Failed to create content component: ', error);
        return {
          success: false,
          errors: [new Error(ErrorType.INTERNAL_SERVER_ERROR)],
          component: null,
        };
      }
    },
  ),
};

export default createContentComponent;
