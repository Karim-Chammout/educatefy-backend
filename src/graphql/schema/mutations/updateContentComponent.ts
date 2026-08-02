import { GraphQLFieldConfig, GraphQLNonNull } from 'graphql';

import {
  AudioContentInput as AudioContentInputType,
  DocumentContentInput as DocumentContentInputType,
  EmbedContentInput as EmbedContentInputType,
  ImageContentInput as ImageContentInputType,
  TextContentInput as TextContentInputType,
  UpdateContentComponentBaseInput as UpdateContentComponentBaseInputType,
  VideoContentInput as VideoContentInputType,
  YouTubeContentInput as YouTubeContentInputType,
} from '../../../types/schema-types.js';
import { ContextType } from '../../../types/types.js';
import { ErrorType } from '../../../utils/ErrorType.js';
import { authenticated } from '../../utils/auth.js';
import { getComponentConfig } from '../../utils/contentComponentRegistry.js';
import { hasTeacherRole } from '../../utils/hasTeacherRole.js';
import AudioContentInput from '../inputs/AudioContent.js';
import DocumentContentInput from '../inputs/DocumentContent.js';
import EmbedContentInput from '../inputs/EmbedContent.js';
import ImageContentInput from '../inputs/ImageContent.js';
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
        baseComponentInfo: UpdateContentComponentBaseInputType;
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

        if (String(baseComponentInfo.type) !== contentComponent.type) {
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

        const isTeacher = await hasTeacherRole(loaders, user.roleId);

        if (!isTeacher) {
          return {
            success: false,
            errors: [new Error(ErrorType.PERMISSION_DENIED)],
            component: null,
          };
        }

        await db.transaction(async (transaction) => {
          const { id, denomination, isPublished, isRequired } = baseComponentInfo;
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
          await transaction(config.table)
            .where('component_id', id)
            .update({
              ...config.updatePayload(contentInput),
              updated_at: db.fn.now(),
            });

          loaders.ContentComponent.loaders.byIdLoader.clear(parseInt(id, 10));
        });

        return {
          success: true,
          errors: [],
          component: contentComponent,
        };
      } catch (error) {
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
