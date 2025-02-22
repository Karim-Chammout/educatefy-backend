import { GraphQLObjectType } from 'graphql';

import {
  ContentComponent as ContentComponentType,
  ContentComponentTypeEnumType,
} from '../../../types/db-generated-types';
import { authenticated } from '../../utils/auth';
import { defaultMutationFields } from './MutationResult';
import { ContentComponent } from './union/ContentComponent';

type MutationResultType =
  | {
      success: true;
      errors: [];
      component: ContentComponentType;
    }
  | {
      success: false;
      errors: Error[];
      component: null;
    };

export const CreateOrUpdateContentComponent = new GraphQLObjectType({
  name: 'CreateOrUpdateContentComponent',
  description: 'The result of the creating or updating a content component.',
  fields: {
    ...defaultMutationFields,
    component: {
      type: ContentComponent,
      description: 'The created or updated content component.',
      resolve: authenticated(async (parent: MutationResultType, _, { loaders }) => {
        if (parent.success) {
          const contentComponent = await loaders.ContentComponent.loadById(parent.component.id);

          const { id, type, denomination, is_published, is_required, rank } = contentComponent;
          const componentValuesToInject = {
            denomination,
            type,
            is_published,
            is_required,
            rank,
          };

          let component = null;

          switch (type) {
            case ContentComponentTypeEnumType.Text:
              const textContent = await loaders.TextContent.loadByComponentId(id);
              component = textContent ? { ...textContent, ...componentValuesToInject } : null;
              break;
            case ContentComponentTypeEnumType.Video:
              const videoContent = await loaders.VideoContent.loadByComponentId(id);
              component = videoContent ? { ...videoContent, ...componentValuesToInject } : null;
              break;
            default:
              component = null;
          }

          return component || null;
        }

        return null;
      }),
    },
  },
});
