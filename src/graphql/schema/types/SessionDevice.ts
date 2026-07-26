import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { UAParser } from 'ua-parser-js';

import { ContextType } from '../../../types/types.js';
import GraphQLDate from '../Scalars/Date.js';

type SessionDeviceRow = {
  browser_raw: string;
  last_active: Date;
  tokens: string[];
};

function parseUserAgent(rawUa: string) {
  const parser = new UAParser(rawUa);
  const result = parser.getResult();

  return {
    browser: result.browser.name || 'Unknown',
    os: result.os.name || 'Unknown',
    device: result.device.type || 'Desktop',
  };
}

export const SessionDevice = new GraphQLObjectType<SessionDeviceRow, ContextType>({
  name: 'SessionDevice',
  description: 'A grouped set of active sessions from the same device/browser.',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      resolve(parent) {
        return parent.browser_raw;
      },
    },
    browser: {
      type: new GraphQLNonNull(GraphQLString),
      resolve(parent) {
        return parseUserAgent(parent.browser_raw).browser;
      },
    },
    os: {
      type: new GraphQLNonNull(GraphQLString),
      resolve(parent) {
        return parseUserAgent(parent.browser_raw).os;
      },
    },
    device: {
      type: new GraphQLNonNull(GraphQLString),
      resolve(parent) {
        return parseUserAgent(parent.browser_raw).device;
      },
    },
    isCurrentDevice: {
      type: new GraphQLNonNull(GraphQLBoolean),
      resolve(parent, __, ctx: ContextType) {
        return ctx.user.currentRefreshToken
          ? parent.tokens.includes(ctx.user.currentRefreshToken)
          : false;
      },
    },
    last_active: {
      type: new GraphQLNonNull(GraphQLDate),
    },
  }),
});
