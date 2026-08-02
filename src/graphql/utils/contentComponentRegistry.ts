import { GraphQLObjectType } from 'graphql';
import type { Knex } from 'knex';

import { ContentComponentTypeEnumType } from '../../types/db-generated-types.js';
import { ContextType } from '../../types/types.js';
import { deleteFile } from '../../utils/fileStorageHandler.js';
import logger from '../../utils/logger.js';
import { TextContent } from '../schema/types/TextContent.js';
import { VideoContent } from '../schema/types/VideoContent.js';
import { YouTubeContent } from '../schema/types/YouTubeContent.js';

/**
 * Content component registry.
 *
 * Single source of truth for every content component type. The GraphQL union,
 * the loader utility and the create/update/delete mutations are all driven by
 * this registry.
 *
 * To add a new content component type:
 *   1. Create a DB table for the type-specific payload (with a `component_id`
 *      FK to `content_component` and `ON DELETE CASCADE`).
 *   2. Add the new value to the `content_component.type` enum via a migration.
 *   3. Generate a DataLoader for the new table.
 *   4. Create a GraphQL object type for it (spread `defaultContentComponentFields`).
 *   5. Register it below with its table, loader, payload mappings and optional
 *      file cleanup.
 *   6. Add the matching input type as an arg of `createContentComponent` /
 *      `updateContentComponent` and pass it through `inputArgName`.
 */

export type ContentComponentTypeConfig = {
  /** The DB enum value of the component type. */
  type: ContentComponentTypeEnumType;
  /** The GraphQL object type exposed through the `ContentComponent` union. */
  graphqlType: GraphQLObjectType;
  /** The table that stores the type-specific payload. */
  table: string;
  /** Loads the type-specific row for a component id. */
  loadByComponentId: (
    loaders: ContextType['loaders'],
    componentId: number,
  ) => Promise<Record<string, unknown> | null | undefined>;
  /** The name of the mutation arg that carries the type-specific payload. */
  inputArgName: 'textContent' | 'videoContent' | 'youtubeContent';
  /** Maps the mutation input to the insert payload of the type-specific table. */
  createPayload: (input: Record<string, unknown>) => Record<string, unknown>;
  /** Maps the mutation input to the update payload of the type-specific table. */
  updatePayload: (input: Record<string, unknown>) => Record<string, unknown>;
  /** Optional cleanup (e.g. removing uploaded files) before the component is deleted. */
  deleteFiles?: (transaction: Knex.Transaction, componentId: number) => Promise<void>;
};

export const CONTENT_COMPONENT_REGISTRY: Record<
  ContentComponentTypeEnumType,
  ContentComponentTypeConfig
> = {
  [ContentComponentTypeEnumType.Text]: {
    type: ContentComponentTypeEnumType.Text,
    graphqlType: TextContent,
    table: 'text_content',
    loadByComponentId: (loaders, componentId) => loaders.TextContent.loadByComponentId(componentId),
    inputArgName: 'textContent',
    createPayload: (input) => ({ content: input.content }),
    updatePayload: (input) => ({ content: input.content }),
  },
  [ContentComponentTypeEnumType.Video]: {
    type: ContentComponentTypeEnumType.Video,
    graphqlType: VideoContent,
    table: 'video_content',
    loadByComponentId: (loaders, componentId) =>
      loaders.VideoContent.loadByComponentId(componentId),
    inputArgName: 'videoContent',
    createPayload: (input) => ({ url: input.url }),
    updatePayload: (input) => ({ url: input.url }),
    deleteFiles: async (transaction, componentId) => {
      const [row] = await transaction('video_content')
        .where('component_id', componentId)
        .select('url');

      if (!row?.url) {
        return;
      }

      try {
        await deleteFile(row.url);
      } catch (error) {
        logger.error({ err: error, componentId }, 'Error deleting video file');
      }
    },
  },
  [ContentComponentTypeEnumType.Youtube]: {
    type: ContentComponentTypeEnumType.Youtube,
    graphqlType: YouTubeContent,
    table: 'youtube_content',
    loadByComponentId: (loaders, componentId) =>
      loaders.YoutubeContent.loadByComponentId(componentId),
    inputArgName: 'youtubeContent',
    createPayload: (input) => ({
      youtube_video_id: input.videoId,
      description: input.description ?? null,
    }),
    updatePayload: (input) => ({
      youtube_video_id: input.videoId,
      description: input.description ?? null,
    }),
  },
};

export const getComponentConfig = (type: string): ContentComponentTypeConfig | undefined =>
  CONTENT_COMPONENT_REGISTRY[type as ContentComponentTypeEnumType];
