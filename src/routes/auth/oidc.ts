import * as client from 'openid-client';

import config from '../../config.js';
import { ErrorType } from '../../utils/ErrorType.js';
import logger from '../../utils/logger.js';

type ProviderConfigType = {
  issuer: string;
  client_id: string;
  client_secret: string;
  redirect_uri: string;
};

export const providers: { [key: string]: ProviderConfigType } = {
  google: {
    issuer: config.GOOGLE_OIDC_ISSUER,
    client_id: config.GOOGLE_CLIENT_ID,
    client_secret: config.GOOGLE_CLIENT_SECRET,
    redirect_uri: config.GOOGLE_REDIRECT_URI,
  },
};

export const getOidcConfig = async (provider: string): Promise<client.Configuration> => {
  const providerConfig = providers[provider];

  try {
    const oidcConfig = await client.discovery(
      new URL(providerConfig.issuer),
      providerConfig.client_id,
      providerConfig.client_secret,
    );

    return oidcConfig;
  } catch (error) {
    logger.error({ err: error }, 'Failed to discover OpenID issuer');
    throw new Error(ErrorType.OIDC_INITIALIZE_FAILED);
  }
};
