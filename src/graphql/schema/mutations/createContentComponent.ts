import { GraphQLFieldConfig, GraphQLNonNull } from 'graphql';

import {
  AudioContentInput as AudioContentInputType,
  ContentComponentBaseInput as ContentComponentBaseInputType,
  DocumentContentInput as DocumentContentInputType,
  EmbedContentInput as EmbedContentInputType,
  ImageContentInput as ImageContentInputType,
  TextContentInput as TextContentInputType,
  VideoContentInput as VideoContentInputType,
  YouTubeContentInput as YouTubeContentInputType,
} from '../../../types/schema-types.js';
import { ContextType } from '../../../types/types.js';
import { ErrorType } from '../../../utils/ErrorType.js';
import { authenticated } from '../../utils/auth.js';
import { getComponentConfig } from '../../utils/contentComponentRegistry.js';
import { hasTeacherRole } from '../../utils/hasTeacherRole.js';
import AudioContentInput from '../inputs/AudioContent.js';
import ContentComponentBaseInput from '../inputs/ContentComponentBase.js';
import DocumentContentInput from '../inputs/DocumentContent.js';
import EmbedContentInput from '../inputs/EmbedContent.js';
import ImageContentInput from '../inputs/ImageContent.js';
import logger from '../../../utils/logger.js';
import TextContentInput from '../inputs/TextContent.js';
import VideoContentInput from '../inputs/VideoContent.js';
import YouTubeContentInput from '../inputs/YouTubeContent.js';
import { CreateOrUpdateContentComponent } from '../types/CreateOrUpdateContentComponent.js';

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
    audioContent: {
      type: AudioContentInput,
      description: 'The audio content for the component.',
    },
    documentContent: {
      type: DocumentContentInput,
      description: 'The document content for the component.',
    },
    embedContent: {
      type: EmbedContentInput,
      description: 'The embedded content for the component.',
    },
    imageContent: {
      type: ImageContentInput,
      description: 'The image content for the component.',
    },
  },
  resolve: authenticated(
    async (
      _,
      args: {
        baseComponentInfo: ContentComponentBaseInputType;
        textContent?: TextContentInputType;
        videoContent?: VideoContentInputType;
        youtubeContent?: YouTubeContentInputType;
        audioContent?: AudioContentInputType;
        documentContent?: DocumentContentInputType;
        embedContent?: EmbedContentInputType;
        imageContent?: ImageContentInputType;
      },
      { db, loaders, user },
    ) => {
      const { baseComponentInfo } = args;

      if (!baseComponentInfo) {
        return {
          success: false,
          errors: [new Error(ErrorType.INVALID_INPUT)],
          component: null,
        };
      }

      const config = getComponentConfig(baseComponentInfo.type);

      if (!config) {
        return {
          success: false,
          errors: [new Error(ErrorType.INVALID_INPUT)],
          component: null,
        };
      }

      const contentInput = args[config.inputArgName];

      if (!contentInput) {
        return {
          success: false,
          errors: [new Error(ErrorType.INVALID_INPUT)],
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

          await transaction(config.table).insert({
            component_id: component.id,
            ...config.createPayload(contentInput),
          });

          return component;
        });

        return {
          success: true,
          errors: [],
          component: createdComponent,
        };
      } catch (error) {
        logger.error({ err: error, userId: user.id }, 'Failed to create content component');
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
