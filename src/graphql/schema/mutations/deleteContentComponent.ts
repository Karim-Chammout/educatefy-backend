import { GraphQLFieldConfig, GraphQLID, GraphQLNonNull } from 'graphql';

import { ComponentType } from '../../../types/schema-types';
import { ContextType } from '../../../types/types';
import { ErrorType } from '../../../utils/ErrorType';
import { deleteFile } from '../../../utils/fileStorageHandler';
import { authenticated } from '../../utils/auth';
import { hasTeacherRole } from '../../utils/hasTeacherRole';
import { ComponentType as ComponentEnumType } from '../types/enum/ContentComponent';
import MutationResult from '../types/MutationResult';

export const deleteContentComponent: GraphQLFieldConfig<null, ContextType> = {
  type: MutationResult,
  description: 'Deletes a content component.',
  args: {
    componentId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The ID of the content component to delete.',
    },
    componentType: {
      type: new GraphQLNonNull(ComponentEnumType),
      description: 'The ID of the content component to delete.',
    },
  },
  resolve: authenticated(
    async (
      _,
      {
        componentId,
        componentType,
      }: {
        componentId: string;
        componentType: ComponentType;
      },
      { db, loaders, user },
    ) => {
      if (!componentId || !componentType) {
        return {
          success: false,
          errors: [new Error(ErrorType.INVALID_INPUT)],
        };
      }

      try {
        const isTeacher = await hasTeacherRole(loaders, user.roleId);

        if (!isTeacher) {
          return {
            success: false,
            errors: [new Error(ErrorType.PERMISSION_DENIED)],
          };
        }

        await db.transaction(async (transaction) => {
          switch (componentType) {
            case 'text':
              await transaction('text_content').where('component_id', componentId).del();
              break;

            case 'video':
              const [deletedVideoContent] = await transaction('video_content')
                .where('component_id', componentId)
                .del()
                .returning('url');

              try {
                await deleteFile(deletedVideoContent.url);
              } catch (error) {
                console.log(
                  `Failed to delete video file. - key: ${deletedVideoContent.url} - Error: `,
                  error,
                );
              }
              break;
          }

          await transaction('content_component').where('id', componentId).del();
        });

        return {
          success: true,
          errors: [],
        };
      } catch (error) {
        console.log('Failed to delete content component: ', error);
        return {
          success: false,
          errors: [new Error(ErrorType.INTERNAL_SERVER_ERROR)],
        };
      }
    },
  ),
};

export default deleteContentComponent;
