import { GraphQLUnionType } from 'graphql';

import {
  CONTENT_COMPONENT_REGISTRY,
  getComponentConfig,
} from '../../../utils/contentComponentRegistry.js';

export const ContentComponent = new GraphQLUnionType({
  name: 'ContentComponent',
  description: 'A content component which can be of various types.',
  types: Object.values(CONTENT_COMPONENT_REGISTRY).map((config) => config.graphqlType),
  resolveType(value) {
    const config = getComponentConfig(value.type);

    if (!config) {
      throw new Error(`Unknown content component type: ${value.type}`);
    }

    return config.graphqlType.name;
  },
});
