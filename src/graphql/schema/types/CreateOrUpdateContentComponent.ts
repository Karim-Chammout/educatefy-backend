import { GraphQLObjectType } from 'graphql';

import { ContentComponent as ContentComponentType } from '../../../types/db-generated-types.js';
import { authenticated } from '../../utils/auth.js';
import { loadComponent } from '../../utils/contentComponentLoader.js';
import { defaultMutationFields } from './MutationResult.js';
import { ContentComponent } from './union/ContentComponent.js';

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

          const component = await loadComponent(loaders, contentComponent);

          return component;
        }

        return null;
      }),
    },
  },
});
