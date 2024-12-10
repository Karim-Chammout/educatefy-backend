import { GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';

import { ContextType } from '../../../types/types';

const OpenidClient = new GraphQLObjectType<any, ContextType>({
  name: 'OpenidClient',
  description: 'The open id client providers to use for auth',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'A unique id of this OIDC',
    },
    identity_provider: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The openId provider',
    },
    button_text: {
      type: GraphQLString,
      description: 'The text of the OIDC that should be displayed on the button',
    },
    button_icon: {
      type: GraphQLString,
      description: 'The icon of the OIDC that should be displayed on the button',
    },
    button_background_color: {
      type: GraphQLString,
      description: 'The button background color of the OIDC',
    },
  },
});

export default OpenidClient;
